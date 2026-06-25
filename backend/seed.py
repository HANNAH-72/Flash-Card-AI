import os
import sys
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def seed_user_data(db, email, full_name, password, created_days_ago=15):
    print(f"\n--- Seeding User: {email} ---")
    
    # Check if user already exists (just in case, but tables are recreated)
    user = db.query(models.User).filter(models.User.email == email.lower()).first()
    if not user:
        user = models.User(
            full_name=full_name,
            email=email.lower(),
            password_hash=hash_password(password),
            created_at=datetime.utcnow() - timedelta(days=created_days_ago)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    user_id = user.id
    print(f"User created: {user.email} (ID: {user_id})")

    # ---------------------------------------------
    # Seed Flashcards
    # ---------------------------------------------
    print(f"Seeding flashcards for {email}...")
    flashcard_data = [
        # Biology
        {
            "subject": "Biology",
            "question": "What is photosynthesis?",
            "answer": "The process by which green plants prepare food using sunlight, water, and carbon dioxide, releasing oxygen as a by-product.",
            "difficulty": "Medium",
            "is_favorite": True
        },
        {
            "subject": "Biology",
            "question": "What gas is released during photosynthesis?",
            "answer": "Oxygen is released as a by-product.",
            "difficulty": "Easy",
            "is_favorite": False
        },
        {
            "subject": "Biology",
            "question": "What is the function of mitochondria in eukaryotic cells?",
            "answer": "Mitochondria are responsible for generating most of the cell's supply of adenosine triphosphate (ATP), serving as the cellular powerhouses.",
            "difficulty": "Hard",
            "is_favorite": True
        },
        # Chemistry
        {
            "subject": "Chemistry",
            "question": "What is an endothermic reaction?",
            "answer": "A chemical reaction that absorbs energy from its surroundings, usually in the form of heat.",
            "difficulty": "Medium",
            "is_favorite": False
        },
        {
            "subject": "Chemistry",
            "question": "What is the chemical symbol for Gold?",
            "answer": "Au (from the Latin word aurum).",
            "difficulty": "Easy",
            "is_favorite": False
        },
        {
            "subject": "Chemistry",
            "question": "What defines a covalent bond?",
            "answer": "A chemical bond formed by the sharing of electron pairs between atoms.",
            "difficulty": "Medium",
            "is_favorite": False
        },
        # Computer Science
        {
            "subject": "Computer Science",
            "question": "What is the Big O time complexity of searching a binary search tree (BST) in the worst case?",
            "answer": "O(n), which occurs when the tree is unbalanced (skewed like a linked list). In balanced trees, it is O(log n).",
            "difficulty": "Hard",
            "is_favorite": True
        },
        {
            "subject": "Computer Science",
            "question": "What is REST in API design?",
            "answer": "Representational State Transfer; an architectural style for design of networked applications that relies on a stateless, client-server protocol (usually HTTP).",
            "difficulty": "Medium",
            "is_favorite": False
        },
        {
            "subject": "Computer Science",
            "question": "What is a primary key in database design?",
            "answer": "A unique identifier for a record in a database table, which must contain unique values and cannot contain NULL values.",
            "difficulty": "Easy",
            "is_favorite": True
        }
    ]

    flashcards = []
    for card in flashcard_data:
        db_card = models.Flashcard(
            user_id=user_id,
            subject=card["subject"],
            question=card["question"],
            answer=card["answer"],
            difficulty=card["difficulty"],
            is_favorite=card["is_favorite"],
            created_at=datetime.utcnow() - timedelta(days=10)
        )
        db.add(db_card)
        flashcards.append(db_card)
    db.commit()
    print(f"Seeded {len(flashcards)} flashcards for {email}.")

    # ---------------------------------------------
    # Seed Reviews (Spaced Repetition history)
    # ---------------------------------------------
    print(f"Seeding reviews for {email}...")
    now = datetime.utcnow()
    reviews = [
        # Card 1 (Biology Photosynthesis) reviewed 6 days ago as Medium -> Next due 4 days ago
        models.Review(
            flashcard_id=flashcards[0].id,
            difficulty="Medium",
            review_date=now - timedelta(days=6),
            next_review_date=now - timedelta(days=4)
        ),
        # Card 1 reviewed again 3 days ago as Easy -> Next due 2 days from now
        models.Review(
            flashcard_id=flashcards[0].id,
            difficulty="Easy",
            review_date=now - timedelta(days=3),
            next_review_date=now + timedelta(days=2)
        ),
        # Card 2 (Biology Gas) reviewed 5 days ago as Easy -> Next due today (completed)
        models.Review(
            flashcard_id=flashcards[1].id,
            difficulty="Easy",
            review_date=now - timedelta(days=5),
            next_review_date=now
        ),
        # Card 3 (Biology Mitochondria) reviewed 1 day ago as Hard -> Next due today
        models.Review(
            flashcard_id=flashcards[2].id,
            difficulty="Hard",
            review_date=now - timedelta(days=1),
            next_review_date=now
        ),
        # Card 4 (Chemistry Endothermic) reviewed 4 days ago as Medium -> Next due 2 days ago
        models.Review(
            flashcard_id=flashcards[3].id,
            difficulty="Medium",
            review_date=now - timedelta(days=4),
            next_review_date=now - timedelta(days=2)
        ),
        # Card 5 (Chemistry Gold) reviewed 8 days ago as Easy -> Next due 3 days ago
        models.Review(
            flashcard_id=flashcards[4].id,
            difficulty="Easy",
            review_date=now - timedelta(days=8),
            next_review_date=now - timedelta(days=3)
        )
    ]
    db.add_all(reviews)
    db.commit()
    print(f"Seeded review history for {email}.")

    # ---------------------------------------------
    # Seed Study Sessions
    # ---------------------------------------------
    print(f"Seeding study sessions for {email}...")
    study_sessions = [
        models.StudySession(
            user_id=user_id,
            session_date=now - timedelta(days=4),
            total_reviewed=10,
            accuracy=80.0
        ),
        models.StudySession(
            user_id=user_id,
            session_date=now - timedelta(days=3),
            total_reviewed=15,
            accuracy=86.6
        ),
        models.StudySession(
            user_id=user_id,
            session_date=now - timedelta(days=2),
            total_reviewed=8,
            accuracy=75.0
        ),
        models.StudySession(
            user_id=user_id,
            session_date=now - timedelta(days=1),
            total_reviewed=12,
            accuracy=91.6
        ),
        # Session today
        models.StudySession(
            user_id=user_id,
            session_date=now,
            total_reviewed=5,
            accuracy=100.0
        )
    ]
    db.add_all(study_sessions)
    db.commit()
    print(f"Seeded study sessions for {email}.")
    print(f"Data seeding successfully completed for {email}!")

def seed_data():
    print("Initializing database tables...")
    Base.metadata.drop_all(bind=engine) # Clear database for fresh seed
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed test user (Alex Mercer)
        seed_user_data(db, "test@example.com", "Alex Mercer", "password123")
        
        # Seed demo user (student@flashmind.ai)
        seed_user_data(db, "student@flashmind.ai", "Demo User", "FlashMind@2026")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
