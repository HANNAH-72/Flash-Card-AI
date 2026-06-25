from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import SessionLocal, engine, Base
from app.routers import auth, flashcards, reviews, analytics, profile
from app import models
from app.auth import hash_password, verify_password

# Create all database tables (PostgreSQL) on startup

app = FastAPI(
    title="FlashMind AI – Smart Flashcard Generator API",
    description="Backend services for FlashMind AI, facilitating text/PDF text extraction, keyword extraction, Flan-T5 flashcard generation, spaced repetition, and analytics dashboards.",
    version="1.0.0"
)

def seed_demo_data_on_startup(db, user_id: int):
    from datetime import datetime, timedelta
    print(f"[STARTUP] Seeding sample data for demo user (ID: {user_id})...", flush=True)
    
    # 1. Sample Flashcards
    flashcard_data = [
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
    print(f"[STARTUP] Seeded {len(flashcards)} flashcards.", flush=True)

    # 2. Spaced Repetition Reviews
    now = datetime.utcnow()
    reviews = [
        models.Review(
            flashcard_id=flashcards[0].id,
            difficulty="Medium",
            review_date=now - timedelta(days=6),
            next_review_date=now - timedelta(days=4)
        ),
        models.Review(
            flashcard_id=flashcards[0].id,
            difficulty="Easy",
            review_date=now - timedelta(days=3),
            next_review_date=now + timedelta(days=2)
        ),
        models.Review(
            flashcard_id=flashcards[1].id,
            difficulty="Easy",
            review_date=now - timedelta(days=5),
            next_review_date=now
        ),
        models.Review(
            flashcard_id=flashcards[2].id,
            difficulty="Hard",
            review_date=now - timedelta(days=1),
            next_review_date=now
        ),
        models.Review(
            flashcard_id=flashcards[3].id,
            difficulty="Medium",
            review_date=now - timedelta(days=4),
            next_review_date=now - timedelta(days=2)
        ),
        models.Review(
            flashcard_id=flashcards[4].id,
            difficulty="Easy",
            review_date=now - timedelta(days=8),
            next_review_date=now - timedelta(days=3)
        )
    ]
    db.add_all(reviews)
    
    # 3. Study Sessions
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
        models.StudySession(
            user_id=user_id,
            session_date=now,
            total_reviewed=5,
            accuracy=100.0
        )
    ]
    db.add_all(study_sessions)
    db.commit()
    print("[STARTUP] Seeding sample data complete.", flush=True)

@app.on_event("startup")
def create_default_demo_user():
    print("[STARTUP] Checking for default demo user in database...", flush=True)
    db = SessionLocal()
    try:
        demo_email = "student@flashmind.ai"
        user = db.query(models.User).filter(models.User.email == demo_email).first()
        if not user:
            print("[STARTUP] Demo user not found. Inserting default demo user...", flush=True)
            user = models.User(
                email=demo_email,
                full_name="Demo User",
                password_hash=hash_password("FlashMind@2026")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"[STARTUP] Demo user created successfully: {demo_email}", flush=True)
        else:
            print("[STARTUP] Demo user exists. Checking password hash validity...", flush=True)
            # Verify if password hash matches 'FlashMind@2026'
            is_valid = verify_password("FlashMind@2026", user.password_hash)
            if not is_valid:
                print("[STARTUP] Demo user password hash is invalid/mismatched. Re-hashing and updating password...", flush=True)
                user.password_hash = hash_password("FlashMind@2026")
                db.commit()
                print("[STARTUP] Demo user password hash updated successfully.", flush=True)
            else:
                print("[STARTUP] Demo user password hash is correct and valid.", flush=True)
            
        # Check if user has flashcards seeded. If not, auto-seed.
        flashcard_count = db.query(models.Flashcard).filter(models.Flashcard.user_id == user.id).count()
        if flashcard_count == 0:
            seed_demo_data_on_startup(db, user.id)
        else:
            print("[STARTUP] Demo user already has seeded flashcards.", flush=True)
            
    except Exception as e:
        print(f"[STARTUP] Error creating/updating default demo user: {str(e)}", flush=True)
        db.rollback()
    finally:
        db.close()

# Configure CORS Middleware
# Allows frontend React application to securely communicate with the FastAPI server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "https://flash-card-ai-j68p.vercel.app/"], # In production, restrict to Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(flashcards.router)
app.include_router(reviews.router)
app.include_router(analytics.router)
app.include_router(profile.router)

# Custom Exception Handler for generic application safety
@app.exception_handler(Exception)
def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An internal server error occurred: {str(exc)}"}
    )

@app.get("/")
def read_root():
    return {
        "app": "FlashMind AI – Smart Flashcard Generator",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
