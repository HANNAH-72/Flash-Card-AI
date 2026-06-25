from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=schemas.AnalyticsResponse)
def get_user_analytics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve detailed learning progress metrics, streak data, and chart metrics."""
    return crud.get_dashboard_analytics(db, current_user.id)
