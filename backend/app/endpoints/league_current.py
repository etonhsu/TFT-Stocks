from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.db_models import User, League
from app.core.token import get_user_from_token

router = APIRouter()


@router.get("/league_current", response_model=League)
async def get_current_league(current_user: User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    current_league = db.query(League).filter(League.id == user.current_league_id).first()
    if not current_league:
        raise HTTPException(status_code=404, detail="Current league not found")

    return current_league
