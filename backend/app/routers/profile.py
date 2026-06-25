from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_user, verify_password

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.put("", response_model=schemas.UserResponse)
def update_profile(
    updates: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile information, including optional password changes."""
    # If the user is trying to change their password or email, require verification
    if updates.new_password or updates.email:
        if not updates.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to update email or set a new password."
            )
        if not verify_password(updates.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect current password."
            )
            
    # Verify email uniqueness if changing email
    if updates.email and updates.email != current_user.email:
        existing_user = crud.get_user_by_email(db, email=updates.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use by another account."
            )

    updated_user = crud.update_user(db, current_user.id, updates)
    return updated_user


@router.delete("", status_code=status.HTTP_200_OK)
def delete_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete user profile and all associated flashcard, study logs data."""
    success = crud.delete_user(db, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "Account successfully deleted"}
