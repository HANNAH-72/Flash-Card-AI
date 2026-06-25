import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app import models, schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    print(f"[AUTH] Hashing password (length: {len(password)})", flush=True)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using bcrypt."""
    print(f"[AUTH] Verifying password (plain length: {len(plain_password)}, hash length: {len(hashed_password) if hashed_password else 0})", flush=True)
    try:
        if not hashed_password:
            print("[AUTH] Verification failed: hashed_password is empty", flush=True)
            return False
        result = bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        print(f"[AUTH] Verification result: {result}", flush=True)
        return result
    except Exception as e:
        print(f"[AUTH] Exception during password verification: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT access token."""
    print(f"[AUTH] Generating access token for payload: {data}", flush=True)
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    try:
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
        print(f"[AUTH] JWT access token generated successfully", flush=True)
        return encoded_jwt
    except Exception as e:
        print(f"[AUTH] Failed to generate JWT token: {str(e)}", flush=True)
        raise

def verify_token(token: str) -> Optional[schemas.TokenData]:
    """Verify JWT access token."""
    print(f"[AUTH] Verifying JWT token: {token[:10]}...", flush=True)
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        if email is None or user_id is None:
            print(f"[AUTH] Token verification failed: missing sub or user_id in payload", flush=True)
            return None
        print(f"[AUTH] Token verified successfully for user: {email} (ID: {user_id})", flush=True)
        return schemas.TokenData(email=email, user_id=user_id)
    except jwt.ExpiredSignatureError:
        print("[AUTH] Token verification failed: expired signature", flush=True)
        return None
    except jwt.InvalidTokenError as e:
        print(f"[AUTH] Token verification failed: invalid token ({str(e)})", flush=True)
        return None
    except jwt.PyJWTError as e:
        print(f"[AUTH] Token verification failed: PyJWT error ({str(e)})", flush=True)
        return None

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """FastAPI dependency to get the current authenticated user."""
    print(f"[SESSION] Validating active session token...", flush=True)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token)
    if token_data is None:
        print("[SESSION] Session validation failed: token is invalid or expired.", flush=True)
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        print(f"[SESSION] Session validation failed: user ID {token_data.user_id} not found in database.", flush=True)
        raise credentials_exception
    print(f"[SESSION] Session validation successful for user: {user.email} (ID: {user.id})", flush=True)
    return user
