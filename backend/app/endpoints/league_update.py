# app/endpoints/user.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.db_models import User
from app.core.token import get_user_from_token
from app.models.models import UserSelf, UpdateCurrentLeagueRequest

router = APIRouter()


@router.put("/users/current_league")
async def update_current_league(
        request: UpdateCurrentLeagueRequest,
        current_user: User = Depends(get_user_from_token),
        db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.current_league_id = request.current_league_id
    db.commit()
    return {"message": "Current league updated successfully"}
