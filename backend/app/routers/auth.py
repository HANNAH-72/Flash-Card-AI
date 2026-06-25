from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timedelta
from app import crud, schemas, models
from app.database import get_db
from app.auth import create_access_token, verify_password, get_current_user, hash_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"[AUTH ROUTER] Registration attempt for email: {user.email}", flush=True)
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        print(f"[AUTH ROUTER] Registration failed: Email {user.email} already registered", flush=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    try:
        new_user = crud.create_user(db=db, user=user)
        print(f"[AUTH ROUTER] Registration successful for email: {user.email} (ID: {new_user.id})", flush=True)
        return new_user
    except Exception as e:
        print(f"[AUTH ROUTER] Registration failed during database insert: {str(e)}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"[AUTH ROUTER] Login attempt for email/username: {form_data.username}", flush=True)
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user:
        reason = "User not found"
        print(f"[AUTH ROUTER] Login failed for {form_data.username}: {reason}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=reason,
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    is_valid = verify_password(form_data.password, user.password_hash)
    if not is_valid:
        reason = "Incorrect password"
        print(f"[AUTH ROUTER] Login failed for {form_data.username}: {reason}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=reason,
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
        print(f"[AUTH ROUTER] Login successful for {user.email}. Token generated.", flush=True)
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        reason = f"Token generation error: {str(e)}"
        print(f"[AUTH ROUTER] Login failed for {user.email}: {reason}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=reason
        )

@router.get("/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    print(f"[AUTH ROUTER] Forgot password request received for email: {req.email}", flush=True)
    user = crud.get_user_by_email(db, email=req.email)
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
        # Fix: change from port 5174 to 5173 (standard Vite development port)
        print(f"\n[PASSWORD RESET LINK] http://localhost:5173/reset-password?token={token}\n", flush=True)
        print(f"[AUTH ROUTER] Secure reset token generated and stored for {req.email}. Expires in 15 mins.", flush=True)
    else:
        print(f"[AUTH ROUTER] Forgot password check failed: Email {req.email} is not registered.", flush=True)
    return {"message": "If this email is registered, a password reset link has been sent."}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    print(f"[AUTH ROUTER] Reset password attempt using token: {req.token[:10]}...", flush=True)
    user = crud.get_user_by_reset_token(db, token=req.token)
    if not user:
        reason = "Invalid reset token."
        print(f"[AUTH ROUTER] Password reset failed: {reason}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
    if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        reason = "Reset token expired."
        print(f"[AUTH ROUTER] Password reset failed for {user.email}: {reason}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
    user.password_hash = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    print(f"[AUTH ROUTER] Password reset successful for user: {user.email}", flush=True)
    return {"message": "Password has been reset successfully."}
