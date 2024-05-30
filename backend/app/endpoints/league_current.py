from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.db_models import League
from app.core.token import get_user_from_token
from app.models.models import UserProfile, UpdateCurrentLeagueRequest

router = APIRouter()

@router.get("/league_current", response_model=UpdateCurrentLeagueRequest)
async def get_current_league(current_user: UserProfile = Depends(get_user_from_token), db: Session = Depends(get_db)):
    current_league = db.query(League).filter(League.id == current_user.current_league_id).first()
    if not current_league:
        raise HTTPException(status_code=404, detail="Current league not found")

    return UpdateCurrentLeagueRequest(current_league_id=current_user.current_league_id)
