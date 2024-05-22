from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.token import verify_token
from app.db.database import get_database_session
from app.models.db_models import User, Player, PlayerData, Portfolio, PortfolioPlayer
from app.models.models import UserPublic, UserSelf
from app.models.pricing_model import price_model

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')  # Adjust tokenUrl if necessary
router = APIRouter()

SET_LEAGUE_ID = 2  # Replace with the actual ID of your set league

@router.get('/users/{username}', response_model=UserPublic)
async def get_user(username: str, db: Session = Depends(get_database_session)):
    user_data = db.query(User).filter(User.username == username).first()
    if not user_data:
        raise HTTPException(status_code=404, detail='User not found')

    portfolio = db.query(Portfolio).filter(Portfolio.league_id == SET_LEAGUE_ID).first()
    if not portfolio:
        portfolio = Portfolio(current_value=0, league_id=SET_LEAGUE_ID)  # Create a default empty portfolio

    portfolio_players = portfolio.portfolio_players if portfolio else []

    portfolio_dict = {}
    for player_data in portfolio_players:
        player = player_data.player
        latest_player_data = db.query(PlayerData).filter(PlayerData.player_id == player.id).order_by(PlayerData.date.desc()).first()
        if latest_player_data:
            current_price = price_model(latest_player_data.league_points)
            portfolio_dict[player.game_name] = {
                'name': player.game_name,
                'tagLine': player.tag_line,
                'current_price': current_price,
                'purchase_price': player_data.purchase_price,
                'shares': player_data.shares
            }

    return UserPublic(
        username=user_data.username,
        portfolio={'players': portfolio_dict, 'holds': []},
        transactions=getattr(user_data, 'transactions', []),
        one_day_change=0.0,  # Compute this value if needed
        three_day_change=0.0,  # Compute this value if needed
        rank=user_data.rank,
        portfolio_history=getattr(user_data, 'portfolio_history', [])
    )

@router.get('/settings', response_model=UserSelf)
async def read_profile(token: str = Depends(oauth2_scheme), db: Session = Depends(get_database_session)):
    username = verify_token(token, credentials_exception=HTTPException(status_code=401, detail='Invalid token'))
    user_data = db.query(User).filter(User.username == username).first()
    if not user_data:
        raise HTTPException(status_code=404, detail='User not found')

    return UserSelf(
        username=user_data.username,
        one_day_change=0.0,  # Compute this value if needed
        three_day_change=0.0,  # Compute this value if needed
        rank=user_data.rank,
        balance=user_data.balance,
        favorites=getattr(user_data, 'favorites', []),
        date_registered=user_data.date_registered
    )
