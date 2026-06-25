from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
from app import models, schemas
from app.auth import hash_password

# --- User CRUD ---

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    if not email:
        return None
    return db.query(models.User).filter(models.User.email == email.lower()).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pwd = hash_password(user.password)
    db_user = models.User(
        email=user.email.lower(),
        full_name=user.full_name,
        password_hash=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, updates: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    if updates.full_name is not None:
        db_user.full_name = updates.full_name
    if updates.email is not None:
        db_user.email = updates.email.lower()
    if updates.new_password is not None:
        db_user.password_hash = hash_password(updates.new_password)
        
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_reset_token(db: Session, token: str):
    return db.query(models.User).filter(models.User.reset_token == token).first()

def delete_user(db: Session, user_id: int) -> bool:
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True


# --- Flashcard CRUD ---

def get_flashcard(db: Session, flashcard_id: int):
    return db.query(models.Flashcard).filter(models.Flashcard.id == flashcard_id).first()

def create_flashcard(db: Session, flashcard: schemas.FlashcardCreate, user_id: int):
    # Check for duplicate flashcard for this user to save space
    duplicate = db.query(models.Flashcard).filter(
        models.Flashcard.user_id == user_id,
        models.Flashcard.subject == flashcard.subject,
        models.Flashcard.question == flashcard.question,
        models.Flashcard.answer == flashcard.answer
    ).first()
    if duplicate:
        return duplicate
        
    db_flashcard = models.Flashcard(
        **flashcard.model_dump(),
        user_id=user_id
    )
    db.add(db_flashcard)
    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard

def get_flashcards(
    db: Session,
    user_id: int,
    search: Optional[str] = None,
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    due_only: bool = False,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.Flashcard).filter(models.Flashcard.user_id == user_id)
    
    if search:
        query = query.filter(
            (models.Flashcard.question.ilike(f"%{search}%")) |
            (models.Flashcard.answer.ilike(f"%{search}%")) |
            (models.Flashcard.subject.ilike(f"%{search}%"))
        )
    if subject:
        query = query.filter(models.Flashcard.subject == subject)
    if difficulty:
        query = query.filter(models.Flashcard.difficulty == difficulty)
    if is_favorite is not None:
        query = query.filter(models.Flashcard.is_favorite == is_favorite)
        
    if due_only:
        # Get flashcards that either have no reviews OR their latest review's next_review_date <= now
        now = datetime.utcnow()
        # Find flashcards whose most recent review has expired
        # Or subquery for latest review
        latest_review_subquery = (
            db.query(
                models.Review.flashcard_id,
                func.max(models.Review.next_review_date).label("latest_due")
            )
            .group_by(models.Review.flashcard_id)
            .subquery()
        )
        query = query.outerjoin(
            latest_review_subquery,
            models.Flashcard.id == latest_review_subquery.c.flashcard_id
        ).filter(
            (latest_review_subquery.c.latest_due == None) |
            (latest_review_subquery.c.latest_due <= now)
        )
        
    # Order by creation date descending
    query = query.order_by(models.Flashcard.created_at.desc())
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total

def update_flashcard(db: Session, flashcard_id: int, updates: schemas.FlashcardUpdate):
    db_card = get_flashcard(db, flashcard_id)
    if not db_card:
        return None
    
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_card, key, value)
        
    db.commit()
    db.refresh(db_card)
    return db_card

def delete_flashcard(db: Session, flashcard_id: int) -> bool:
    db_card = get_flashcard(db, flashcard_id)
    if not db_card:
        return False
    db.delete(db_card)
    db.commit()
    return True


# --- Review & Spaced Repetition CRUD ---

def create_review(db: Session, review_in: schemas.ReviewCreate) -> models.Review:
    """
    Submits a flashcard review rating (Easy, Medium, Hard) and computes 
    the next due date according to spaced repetition schedules.
    """
    # Spaced repetition scheduling intervals
    # Hard = 1 day, Medium = 2 days, Easy = 5 days
    days_map = {"Hard": 1, "Medium": 2, "Easy": 5}
    days = days_map.get(review_in.difficulty, 2)
    
    now = datetime.utcnow()
    next_due = now + timedelta(days=days)
    
    db_review = models.Review(
        flashcard_id=review_in.flashcard_id,
        difficulty=review_in.difficulty,
        review_date=now,
        next_review_date=next_due
    )
    
    # Optionally update the flashcard's dynamic difficulty (learning feedback)
    db_card = get_flashcard(db, review_in.flashcard_id)
    if db_card:
        # If reviewed as Easy, it reinforces/maintains ease. If Hard, keeps/moves to Hard.
        pass
        
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_reviews_for_card(db: Session, flashcard_id: int):
    return db.query(models.Review).filter(models.Review.flashcard_id == flashcard_id).all()


# --- Study Session CRUD ---

def create_study_session(db: Session, session_in: schemas.StudySessionCreate, user_id: int) -> models.StudySession:
    db_session = models.StudySession(
        user_id=user_id,
        session_date=datetime.utcnow(),
        total_reviewed=session_in.total_reviewed,
        accuracy=session_in.accuracy
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_study_sessions(db: Session, user_id: int, limit: int = 10):
    return db.query(models.StudySession)\
             .filter(models.StudySession.user_id == user_id)\
             .order_by(models.StudySession.session_date.desc())\
             .limit(limit).all()


# --- Analytics & Summaries ---

def calculate_study_streak(db: Session, user_id: int) -> int:
    """Calculate the active daily study streak for the user."""
    sessions = db.query(models.StudySession)\
                 .filter(models.StudySession.user_id == user_id)\
                 .order_by(models.StudySession.session_date.desc())\
                 .all()
    if not sessions:
        return 0
        
    streak = 0
    today = datetime.utcnow().date()
    current_target = today
    
    # Extract unique dates in order
    session_dates = sorted(list(set(s.session_date.date() for s in sessions)), reverse=True)
    
    # If the last study session was not today or yesterday, the streak has cooled off
    if session_dates[0] < today - timedelta(days=1):
        return 0
        
    for date in session_dates:
        if date == current_target or date == current_target - timedelta(days=1):
            streak += 1
            current_target = date
        else:
            break
            
    return streak

def get_dashboard_analytics(db: Session, user_id: int) -> schemas.AnalyticsResponse:
    # 1. Total Flashcards
    total_cards = db.query(models.Flashcard).filter(models.Flashcard.user_id == user_id).count()
    
    # 2. Total Reviews
    total_reviews = db.query(models.Review).join(models.Flashcard).filter(models.Flashcard.user_id == user_id).count()
    
    # 3. Accuracy Percentage
    avg_accuracy_q = db.query(func.avg(models.StudySession.accuracy))\
                        .filter(models.StudySession.user_id == user_id)\
                        .scalar()
    accuracy = float(avg_accuracy_q) if avg_accuracy_q is not None else 0.0
    
    # 4. Study Streak
    streak = calculate_study_streak(db, user_id)
    
    # 5. Due Today, AI Notes, Completion Rate calculations
    now_dt = datetime.utcnow()
    
    # Cards due today (no reviews OR latest review next_review_date <= now)
    latest_review_subquery = (
        db.query(
            models.Review.flashcard_id,
            func.max(models.Review.next_review_date).label("latest_due")
        )
        .group_by(models.Review.flashcard_id)
        .subquery()
    )
    cards_due_today = db.query(models.Flashcard).filter(models.Flashcard.user_id == user_id).outerjoin(
        latest_review_subquery,
        models.Flashcard.id == latest_review_subquery.c.flashcard_id
    ).filter(
        (latest_review_subquery.c.latest_due == None) |
        (latest_review_subquery.c.latest_due <= now_dt)
    ).count()

    # AI Generated Notes (represented by unique categories created)
    ai_generated_notes = db.query(models.Flashcard.subject).filter(models.Flashcard.user_id == user_id).distinct().count()

    # Review completion rate: today's reviews vs total due + done
    reviews_completed_today = db.query(models.Review).join(models.Flashcard)\
                                .filter(models.Flashcard.user_id == user_id)\
                                .filter(func.date(models.Review.review_date) == now_dt.date())\
                                .count()
    total_possible = reviews_completed_today + cards_due_today
    completion_rate = (reviews_completed_today / total_possible * 100.0) if total_possible > 0 else 100.0
    
    # 6. Weekly progress (reviews in the last 7 days)
    weekly_progress = []
    now = datetime.utcnow().date()
    for i in range(6, -1, -1):
        target_date = now - timedelta(days=i)
        day_str = target_date.strftime("%a") # e.g. Mon, Tue
        # Count reviews on this date
        count = db.query(models.Review).join(models.Flashcard)\
                  .filter(models.Flashcard.user_id == user_id)\
                  .filter(func.date(models.Review.review_date) == target_date)\
                  .count()
        weekly_progress.append(schemas.WeeklyProgress(day=day_str, reviewed=count))
        
    # 7. Subject Performance
    subjects_q = db.query(
        models.Flashcard.subject,
        func.count(models.Flashcard.id).label("card_count")
    ).filter(models.Flashcard.user_id == user_id)\
     .group_by(models.Flashcard.subject).all()
     
    subject_performance = []
    for subj, count in subjects_q:
        reviews_for_subj = db.query(models.Review.difficulty)\
                             .join(models.Flashcard)\
                             .filter(models.Flashcard.user_id == user_id)\
                             .filter(models.Flashcard.subject == subj)\
                             .all()
        if reviews_for_subj:
            correct = sum(1 for r in reviews_for_subj if r.difficulty in ["Easy", "Medium"])
            sub_acc = (correct / len(reviews_for_subj)) * 100
        else:
            sub_acc = 100.0
        subject_performance.append(
            schemas.SubjectPerformance(subject=subj, count=count, accuracy=round(sub_acc, 1))
        )
        
    # 8. Difficulty Distribution
    diffs_q = db.query(
        models.Flashcard.difficulty,
        func.count(models.Flashcard.id).label("count")
    ).filter(models.Flashcard.user_id == user_id)\
     .group_by(models.Flashcard.difficulty).all()
     
    diff_dist = {d: 0 for d in ["Easy", "Medium", "Hard"]}
    for diff, count in diffs_q:
        if diff in diff_dist:
            diff_dist[diff] = count
            
    difficulty_distribution = [
        schemas.DifficultyDistribution(difficulty=k, count=v)
        for k, v in diff_dist.items()
    ]
    
    return schemas.AnalyticsResponse(
        total_flashcards=total_cards,
        total_reviews=total_reviews,
        accuracy_percentage=round(accuracy, 1),
        study_streak=streak,
        cards_due_today=cards_due_today,
        ai_generated_notes=ai_generated_notes,
        review_completion_rate=round(completion_rate, 1),
        weekly_progress=weekly_progress,
        subject_performance=subject_performance,
        difficulty_distribution=difficulty_distribution
    )
