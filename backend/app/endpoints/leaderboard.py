from fastapi import APIRouter, HTTPException, status, Query, Depends
from sqlalchemy.orm import Session

from app.models.db_models import User
from app.models.models import LeaderboardResponse, PortfolioLeaderboardResponse, UserProfile
from app.core.logic import fetch_leaderboard_entries, fetch_portfolio_leaderboard
from app.db.database import get_db
from app.core.token import get_user_from_token  # Ensure you have the get_user_from_token dependency
import logging

router = APIRouter()


def response_model_selector(lead_type: str):
    if lead_type == "portfolio":
        return PortfolioLeaderboardResponse
    elif lead_type in ["lp", "delta_8h", "delta_24h", "delta_72h", "neg_8h", "neg_24h", "neg_72h"]:
        return LeaderboardResponse
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid leaderboard type")


@router.get('/leaderboard/{lead_type}')
async def get_leaderboard(
        lead_type: str,
        response_model=Depends(response_model_selector),
        limit: int = Query(default=100, ge=1),
        page: int = Query(default=0, ge=0),
        db: Session = Depends(get_db),
        current_user: UserProfile = Depends(get_user_from_token)
):
    try:
        logging.debug(f"Fetching user with username: {current_user.username}")
        user = db.query(User).filter(User.username == current_user.username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        logging.debug(f"User found: {user}")

        if lead_type == "portfolio":
            entries = fetch_portfolio_leaderboard(current_user=user, page=page, limit=limit, db=db)
        else:
            entries = fetch_leaderboard_entries(lead_type=lead_type, page=page, limit=limit, db=db)

        return response_model(leaderboard_type=lead_type, entries=entries)
    except Exception as e:
        logging.error(f"Error in get_leaderboard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch leaderboard data: {str(e)}")
