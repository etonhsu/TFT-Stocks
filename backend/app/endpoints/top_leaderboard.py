from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.db.database import get_db
from app.models.db_models import User, Player, PlayerData, Portfolio, PortfolioHistory, UserLeagues
from app.models.models import TopLeaderboard, TopLeaderboardEntry
from app.models.pricing_model import price_model

router = APIRouter()

@router.get("/top_leaderboard", response_model=TopLeaderboard)
async def get_top_leaderboard(db: Session = Depends(get_db)):
    try:
        # Fetch top deltas with name and tagLine
        top_8h = db.query(Player).order_by(desc(Player.delta_8h)).first()
        top_24h = db.query(Player).order_by(desc(Player.delta_24h)).first()
        top_72h = db.query(Player).order_by(desc(Player.delta_72h)).first()

        # Subquery to get the latest PlayerData entry for each player
        player_subquery = db.query(
            PlayerData.player_id,
            func.max(PlayerData.date).label('max_date')
        ).group_by(PlayerData.player_id).subquery()

        # Fetch top price with name and tagLine based on the latest league points
        price_data = db.query(Player, PlayerData.league_points)\
            .join(PlayerData, Player.id == PlayerData.player_id)\
            .join(player_subquery, (PlayerData.player_id == player_subquery.c.player_id) & (PlayerData.date == player_subquery.c.max_date))\
            .order_by(desc(PlayerData.league_points))\
            .first()

        # Subquery to get the latest PortfolioHistory entry for each portfolio
        portfolio_subquery = db.query(
            PortfolioHistory.portfolio_id,
            func.max(PortfolioHistory.date).label('max_date')
        ).group_by(PortfolioHistory.portfolio_id).subquery()

        # Fetch top portfolio value with name
        portfolio_data = db.query(User, PortfolioHistory.value)\
            .join(UserLeagues, User.id == UserLeagues.user_id)\
            .join(Portfolio, Portfolio.id == UserLeagues.portfolio_id)\
            .join(PortfolioHistory, Portfolio.id == PortfolioHistory.portfolio_id)\
            .join(portfolio_subquery, (PortfolioHistory.portfolio_id == portfolio_subquery.c.portfolio_id) & (PortfolioHistory.date == portfolio_subquery.c.max_date))\
            .order_by(desc(PortfolioHistory.value))\
            .first()

        # Construct response
        response = TopLeaderboard(
            price=TopLeaderboardEntry(name=price_data[0].game_name, tagLine=price_data[0].tag_line, value=price_model(float(price_data[1]))) if price_data else None,
            delta_8h=TopLeaderboardEntry(name=top_8h.game_name, tagLine=top_8h.tag_line, value=top_8h.delta_8h) if top_8h else None,
            delta_24h=TopLeaderboardEntry(name=top_24h.game_name, tagLine=top_24h.tag_line, value=top_24h.delta_24h) if top_24h else None,
            delta_72h=TopLeaderboardEntry(name=top_72h.game_name, tagLine=top_72h.tag_line, value=top_72h.delta_72h) if top_72h else None,
            portfolio_value=TopLeaderboardEntry(name=portfolio_data[0].username, value=portfolio_data[1]) if portfolio_data else None
        )

        if not all([response.price, response.delta_8h, response.delta_24h, response.delta_72h, response.portfolio_value]):
            raise HTTPException(status_code=404, detail="Failed to retrieve all top leaderboard data")

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
