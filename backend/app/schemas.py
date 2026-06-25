from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

# --- Authentication Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# --- Flashcard Schemas ---
class FlashcardBase(BaseModel):
    subject: str
    question: str
    answer: str
    difficulty: str = "Medium"
    is_favorite: bool = False

class FlashcardCreate(FlashcardBase):
    pass

class FlashcardUpdate(BaseModel):
    subject: Optional[str] = None
    question: Optional[str] = None
    answer: Optional[str] = None
    difficulty: Optional[str] = None
    is_favorite: Optional[bool] = None

class FlashcardResponse(FlashcardBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Review Schemas ---
class ReviewCreate(BaseModel):
    flashcard_id: int
    difficulty: str  # Easy, Medium, Hard

class ReviewResponse(BaseModel):
    id: int
    flashcard_id: int
    difficulty: str
    review_date: datetime
    next_review_date: datetime

    class Config:
        from_attributes = True


# --- Study Session Schemas ---
class StudySessionCreate(BaseModel):
    total_reviewed: int
    accuracy: float

class StudySessionResponse(BaseModel):
    id: int
    user_id: int
    session_date: datetime
    total_reviewed: int
    accuracy: float

    class Config:
        from_attributes = True


# --- Generation Request ---
class NotesGenerateRequest(BaseModel):
    notes: str
    subject: Optional[str] = "General"


# --- Dashboard / Analytics Schemas ---
class SubjectPerformance(BaseModel):
    subject: str
    count: int
    accuracy: float

class DifficultyDistribution(BaseModel):
    difficulty: str
    count: int

class WeeklyProgress(BaseModel):
    day: str  # e.g., Mon, Tue
    reviewed: int

class AnalyticsResponse(BaseModel):
    total_flashcards: int
    total_reviews: int
    accuracy_percentage: float
    study_streak: int
    cards_due_today: int
    ai_generated_notes: int
    review_completion_rate: float
    weekly_progress: List[WeeklyProgress]
    subject_performance: List[SubjectPerformance]
    difficulty_distribution: List[DifficultyDistribution]
