from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.token import verify_token, get_user_from_token
from app.db.database import get_db
from app.models.db_models import User, Player, PlayerData, Portfolio, PortfolioPlayer, UserLeagues, League, PortfolioHold, PortfolioHistory as DBPortfolioHistory, Transaction as DBTransaction, Favorite
from app.models.models import UserProfile, Player as PlayerModel, Holds, Transaction as TransactionModel, \
    PortfolioHistory, FavoritesEntry, LeagueWithPortfolio, League as LeagueModel, Portfolio as PortfolioModel, \
    UserPublic, UserSelf, UserProfileView
from app.models.pricing_model import price_model
from app.utils.portfolio_change import portfolio_change

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')  # Adjust tokenUrl if necessary
router = APIRouter()

@router.get('/users/{username}', response_model=UserProfileView)
async def get_user(username: str, current_user: UserProfile = Depends(get_user_from_token),
                   db: Session = Depends(get_db)):
    # Fetch the logged-in user (current_user) to get their current_league_id
    logged_in_user = db.query(User).filter(User.username == current_user.username).first()
    if not logged_in_user:
        raise HTTPException(status_code=404, detail='Logged in user not found')

    # Fetch the user data (profile being viewed)
    user_data = db.query(User).filter(User.username == username).first()
    if not user_data:
        raise HTTPException(status_code=404, detail='User not found')

    # Fetch all leagues the user is part of
    user_leagues = db.query(UserLeagues).filter(UserLeagues.user_id == user_data.id).all()
    leagues_with_portfolios = []

    for user_league in user_leagues:
        league_data = db.query(League).filter(League.id == user_league.league_id).first()

        portfolio = db.query(Portfolio).filter(Portfolio.id == user_league.portfolio_id).first()
        if not portfolio:
            portfolio = Portfolio(current_value=0, id=user_league.portfolio_id)  # Create a default empty portfolio

        portfolio_players = db.query(PortfolioPlayer).filter(PortfolioPlayer.portfolio_id == portfolio.id).all()
        players = {}
        for pp in portfolio_players:
            player = db.query(Player).filter(Player.id == pp.player_id).first()
            if player:
                player_data = db.query(PlayerData).filter(PlayerData.player_id == player.id).order_by(
                    PlayerData.date.desc()).first()
                current_price = price_model(player_data.league_points) if player_data else pp.purchase_price
                players[player.game_name] = PlayerModel(
                    name=player.game_name,
                    tagLine=player.tag_line,
                    current_price=current_price,
                    purchase_price=pp.purchase_price,
                    shares=pp.shares
                )

        holds = db.query(PortfolioHold).filter(PortfolioHold.portfolio_id == portfolio.id).all()
        holds_list = [
            Holds(
                id=hold.id,
                gameName=hold.player.game_name,
                shares=hold.shares,
                hold_deadline=hold.hold_deadline
            )
            for hold in holds
        ]

        portfolio_history = db.query(DBPortfolioHistory).filter(DBPortfolioHistory.portfolio_id == portfolio.id).all()
        portfolio_history_list = [
            PortfolioHistory(
                id=history.id,
                value=history.value,
                date=history.date
            )
            for history in portfolio_history
        ]

        transactions = db.query(DBTransaction).filter(DBTransaction.portfolio_id == portfolio.id).all()
        transactions_list = [
            TransactionModel(
                id=transaction.id,
                type=transaction.type,
                gameName=transaction.player.game_name,
                shares=transaction.shares,
                price=float(transaction.price),
                transaction_date=transaction.transaction_date
            )
            for transaction in transactions
        ]

        leagues_with_portfolios.append(LeagueWithPortfolio(
            league=LeagueModel(
                id=league_data.id,
                name=league_data.name,
                start_date=league_data.start_date,
                end_date=league_data.end_date,
                created_by=league_data.created_by
            ),
            portfolio=PortfolioModel(
                id=portfolio.id,
                players=players,
                holds=holds_list
            ),
            portfolio_history=portfolio_history_list,
            transactions=transactions_list,
            one_day_change=0.0,  # Compute this value if needed
            three_day_change=0.0,  # Compute this value if needed
            balance=user_league.balance,
            rank=user_league.rank
        ))

    favorites = db.query(Favorite).filter(Favorite.user_id == user_data.id).all()
    favorites_list = [
        FavoritesEntry(
            name=favorite.player.game_name,
            current_price=price_model(db.query(PlayerData).filter(PlayerData.player_id == favorite.player.id).order_by(
                PlayerData.date.desc()).first().league_points),
            eight_hour_change=favorite.player.delta_8h,
            one_day_change=favorite.player.delta_24h,
            three_day_change=favorite.player.delta_72h,
            tag_line=favorite.player.tag_line
        )
        for favorite in favorites
    ]

    user_profile = UserProfileView(
        username=user_data.username,
        leagues=leagues_with_portfolios,
        favorites=favorites_list,
        current_league_id=user_data.current_league_id,
        league_id=logged_in_user.current_league_id
    )

    user_profile = portfolio_change(user_profile)

    return user_profile


@router.get('/settings', response_model=UserSelf)
async def read_profile(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    username = verify_token(token, credentials_exception=HTTPException(status_code=401, detail='Invalid token'))
    user_data = db.query(User).filter(User.username == username).first()
    if not user_data:
        raise HTTPException(status_code=404, detail='User not found')

    return UserSelf(
        username=user_data.username,
        password=user_data.password,
        date_registered=user_data.date_registered,
    )