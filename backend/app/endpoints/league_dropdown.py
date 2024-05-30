# app/endpoints/user_leagues.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.db_models import User, UserLeagues, League, Portfolio
from app.core.token import get_user_from_token
from app.models.models import LeagueDropdown, UserProfile

router = APIRouter()


@router.get("/user_leagues", response_model=list[LeagueDropdown])
async def get_user_leagues(current_user: UserProfile = Depends(get_user_from_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_leagues = db.query(UserLeagues).filter(UserLeagues.user_id == user.id).all()
    league_overviews = []
    for user_league in user_leagues:
        league = db.query(League).filter(League.id == user_league.league_id).first()
        portfolio = db.query(Portfolio).filter(Portfolio.id == user_league.portfolio_id).first()
        league_dropdown = {
            "name": league.name,
            "current_value": portfolio.current_value,
            "rank": user_league.rank,
            "league_id": league.id
        }
        league_overviews.append(league_dropdown)

    return league_overviews
