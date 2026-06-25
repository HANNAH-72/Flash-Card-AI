from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews & Spaced Repetition"])

@router.post("", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_card_review(
    review: schemas.ReviewCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log a card review. 
    Computes spaced repetition parameters and updates the next_review_date.
    """
    card = crud.get_flashcard(db, review.flashcard_id)
    if not card or card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    return crud.create_review(db, review)


@router.get("", response_model=List[schemas.ReviewResponse])
def get_user_review_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the log of all flashcard reviews performed by the user."""
    # Query reviews belonging to current user
    reviews = db.query(models.Review)\
                .join(models.Flashcard)\
                .filter(models.Flashcard.user_id == current_user.id)\
                .order_by(models.Review.review_date.desc())\
                .all()
    return reviews


@router.post("/session", response_model=schemas.StudySessionResponse)
def log_study_session(
    session_data: schemas.StudySessionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a completed flashcard study session to compute streaks and accuracy metrics."""
    if session_data.total_reviewed <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total reviewed cards in a session must be greater than zero."
        )
    return crud.create_study_session(db, session_data, current_user.id)


@router.get("/sessions", response_model=List[schemas.StudySessionResponse])
def get_study_sessions_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve history of completed study sessions."""
    return crud.get_study_sessions(db, current_user.id)
