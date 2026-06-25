import io
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas, models, nlp
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/flashcards", tags=["Flashcards"])

@router.post("/generate", response_model=List[schemas.FlashcardResponse])
def generate_from_notes(
    payload: schemas.NotesGenerateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate flashcards from pasted text notes using the NLP pipeline."""
    if not payload.notes.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notes content cannot be empty"
        )
        
    cards_data = nlp.generate_flashcards_pipeline(payload.notes)
    if not cards_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Failed to extract meaningful educational content. Please write more detailed notes."
        )
        
    created_cards = []
    for card_data in cards_data:
        card_in = schemas.FlashcardCreate(
            subject=payload.subject or "General",
            question=card_data["question"],
            answer=card_data["answer"],
            difficulty=card_data["difficulty"],
            is_favorite=False
        )
        db_card = crud.create_flashcard(db, card_in, current_user.id)
        created_cards.append(db_card)
        
    return created_cards


@router.post("/generate/pdf", response_model=List[schemas.FlashcardResponse])
async def generate_from_pdf(
    file: UploadFile = File(...),
    subject: str = Form("General"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate flashcards from an uploaded PDF document."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a PDF"
        )
        
    import os
    import uuid
    
    # Ensure backend/uploads directory exists
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    uploads_dir = os.path.join(backend_dir, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_file_path = os.path.join(uploads_dir, temp_filename)
    
    text = ""
    try:
        # Save uploaded PDF temporarily
        contents = await file.read()
        with open(temp_file_path, "wb") as buffer:
            buffer.write(contents)
            
        # Extract text from the saved PDF file
        text = nlp.extract_text_from_pdf(temp_file_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading PDF content: {str(e)}"
        )
    finally:
        # Always clean up/delete the temporary PDF file immediately after processing
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                # Log deletion failure but don't crash the request
                pass
        
    if not text.strip() or len(text.split()) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The PDF does not contain sufficient text layout."
        )
        
    cards_data = nlp.generate_flashcards_pipeline(text)
    if not cards_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract flashcard cards from this PDF notes."
        )
        
    created_cards = []
    for card_data in cards_data:
        card_in = schemas.FlashcardCreate(
            subject=subject,
            question=card_data["question"],
            answer=card_data["answer"],
            difficulty=card_data["difficulty"],
            is_favorite=False
        )
        db_card = crud.create_flashcard(db, card_in, current_user.id)
        created_cards.append(db_card)
        
    return created_cards


@router.post("", response_model=schemas.FlashcardResponse, status_code=status.HTTP_201_CREATED)
def create_manual_card(
    flashcard: schemas.FlashcardCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually create a new flashcard."""
    return crud.create_flashcard(db, flashcard, current_user.id)


@router.get("")
def list_cards(
    search: Optional[str] = None,
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    due_only: bool = False,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve flashcards with flexible search filters, favorite toggles, and pagination."""
    items, total = crud.get_flashcards(
        db,
        user_id=current_user.id,
        search=search,
        subject=subject,
        difficulty=difficulty,
        is_favorite=is_favorite,
        due_only=due_only,
        skip=skip,
        limit=limit
    )
    # Extract unique subjects for filtering headers on frontend
    subjects_q = db.query(models.Flashcard.subject)\
                    .filter(models.Flashcard.user_id == current_user.id)\
                    .distinct().all()
    subjects = [s[0] for s in subjects_q]
    
    return {
        "items": items,
        "total": total,
        "subjects": subjects
    }


@router.get("/{id}", response_model=schemas.FlashcardResponse)
def get_card_by_id(
    id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific flashcard."""
    card = crud.get_flashcard(db, id)
    if not card or card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    return card


@router.put("/{id}", response_model=schemas.FlashcardResponse)
def update_card(
    id: int,
    updates: schemas.FlashcardUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update details of a specific flashcard."""
    card = crud.get_flashcard(db, id)
    if not card or card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    return crud.update_flashcard(db, id, updates)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a flashcard."""
    card = crud.get_flashcard(db, id)
    if not card or card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    crud.delete_flashcard(db, id)
    return
