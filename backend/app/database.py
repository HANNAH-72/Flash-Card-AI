import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL
is_fallback = False

# Detect placeholder credentials
if "USER:PASSWORD" in db_url or "ep-hostname" in db_url:
    print("[DATABASE] Warning: Default Neon PostgreSQL placeholder detected. Falling back to local SQLite.", flush=True)
    is_fallback = True
else:
    try:
        # Attempt to test connection to custom database
        temp_engine = create_engine(db_url)
        conn = temp_engine.connect()
        conn.close()
        temp_engine.dispose()
        print("[DATABASE] Successfully connected to Neon PostgreSQL.", flush=True)
    except Exception as e:
        print(f"[DATABASE] Connection to Neon PostgreSQL failed: {str(e)}", flush=True)
        print("[DATABASE] Warning: Falling back to local SQLite database for development.", flush=True)
        is_fallback = True

if is_fallback:
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(backend_dir, "flashmind.db")
    db_url = f"sqlite:///{db_path}"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
