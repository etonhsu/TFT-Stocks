from fastapi import APIRouter, HTTPException, status, Query, Depends
from sqlalchemy.orm import Session

from app.models.models import LeaderboardResponse, PortfolioLeaderboardResponse
from app.core.logic import fetch_leaderboard_entries, fetch_portfolio_leaderboard
from app.db.database import get_database_session

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
    response_model=Depends(response_model_selector),  # Inject the dynamically determined model
    limit: int = Query(default=100, ge=1),
    page: int = Query(default=0, ge=0),
    db: Session = Depends(get_database_session)  # Inject the database session
):
    if lead_type == "portfolio":
        entries = fetch_portfolio_leaderboard(page=page, limit=limit, db=db)
    else:
        entries = fetch_leaderboard_entries(lead_type=lead_type, page=page, limit=limit, db=db)

    return response_model(leaderboard_type=lead_type, entries=entries)
