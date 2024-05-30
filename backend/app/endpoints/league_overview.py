from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.db_models import User, UserLeagues, League
from app.models.models import LeagueOverview, UserProfile
from app.core.token import get_user_from_token

router = APIRouter()

@router.get("/leagues", response_model=List[LeagueOverview])
async def get_leagues(current_user: UserProfile = Depends(get_user_from_token), db: Session = Depends(get_db)):
    try:
        # Fetch the user by their username to get the user ID
        user = db.query(User).filter(User.username == current_user.username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch user leagues
        user_leagues = db.query(UserLeagues).filter(UserLeagues.user_id == user.id).all()
        league_ids = [ul.league_id for ul in user_leagues]

        # Fetch leagues based on league_ids
        leagues = db.query(League).filter(League.id.in_(league_ids)).all()

        # Create league overviews
        league_overviews = []
        for league in leagues:
            league_overview = LeagueOverview(
                name=league.name,
                start_date=league.start_date,
                end_date=league.end_date,
                player_count=league.player_count,
                max_players=league.max_players,
                password=league.password,
                is_creator=(league.created_by == user.id)
            )
            league_overviews.append(league_overview)

        return league_overviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
