from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    reset_token = Column(String, unique=True, index=True, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    flashcards = relationship("Flashcard", back_populates="user", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String, nullable=False, index=True)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    difficulty = Column(String, default="Medium")  # Easy, Medium, Hard
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="flashcards")
    reviews = relationship("Review", back_populates="flashcard", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id", ondelete="CASCADE"), nullable=False)
    difficulty = Column(String, nullable=False)  # Easy, Medium, Hard (user rating)
    review_date = Column(DateTime, default=datetime.utcnow)
    next_review_date = Column(DateTime, nullable=False)

    # Relationships
    flashcard = relationship("Flashcard", back_populates="reviews")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_date = Column(DateTime, default=datetime.utcnow)
    total_reviewed = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)  # Percentage (e.g. 85.5)

    # Relationships
    user = relationship("User", back_populates="study_sessions")
