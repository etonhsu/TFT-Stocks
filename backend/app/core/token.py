from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

from app.db.database import get_database_session
from app.models.db_models import User, Portfolio, PortfolioPlayer, PortfolioHold, Transaction, Player, \
    PortfolioHistory as DBPortfolioHistory, League as DBLeague, PlayerData, UserLeagues as DBUserLeagues, Transaction as DBTransaction
from app.models.models import UserProfile, Portfolio as PortfolioModel, Player as PlayerModel, Holds, \
    Transaction, PortfolioHistory, LeagueWithPortfolio, League
from app.models.pricing_model import price_model
from app.utils.get_secret import get_secret
from datetime import datetime, timedelta, timezone
import logging
import jwt

secrets = get_secret('tft-stocks-keys')
key = secrets['secret_key']
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

logging.basicConfig(level=logging.DEBUG)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta if expires_delta else timedelta(minutes=180))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, key, algorithm=ALGORITHM)
    logging.debug(f"Token created with expiry {expire} and data {to_encode}")
    return encoded_jwt

def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, key, algorithms=[ALGORITHM])
        logging.debug(f"Decoded payload: {payload}")
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except jwt.ExpiredSignatureError as e:
        logging.error("Token expired: " + str(e))
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.DecodeError as e:
        logging.error("Token decode error: " + str(e))
        raise credentials_exception

def get_user_from_token(token: str = Depends(oauth2_scheme)):
    try:
        username = verify_token(token, credentials_exception=HTTPException(status_code=401, detail="Invalid token"))
        logging.debug(f"Username from token: {username}")

        with get_database_session() as db:
            user = db.query(User).filter(User.username == username).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            logging.debug(f"User record: {user}")

            user_leagues = db.query(DBUserLeagues).filter(DBUserLeagues.user_id == user.id).all()
            leagues_with_portfolios = []

            for user_league in user_leagues:
                league = db.query(DBLeague).filter(DBLeague.id == user_league.league_id).first()
                portfolio = db.query(Portfolio).filter(Portfolio.id == user_league.portfolio_id).first()

                # Fetch related entities for the portfolio
                players = db.query(PortfolioPlayer).filter(PortfolioPlayer.portfolio_id == portfolio.id).all()
                holds = db.query(PortfolioHold).filter(PortfolioHold.portfolio_id == portfolio.id).all()
                portfolio_history = db.query(DBPortfolioHistory).filter(DBPortfolioHistory.portfolio_id == portfolio.id).all()
                transactions = db.query(DBTransaction).filter(DBTransaction.portfolio_id == portfolio.id).all()

                # Construct the players dictionary
                players_dict = {}
                for player in players:
                    player_data = db.query(PlayerData).filter(PlayerData.player_id == player.player_id).order_by(PlayerData.date.desc()).first()
                    current_price = price_model(player_data.league_points) if player_data else player.purchase_price
                    player_record = db.query(Player).filter(Player.id == player.player_id).first()
                    players_dict[player_record.game_name] = PlayerModel(
                        name=player_record.game_name,
                        tagLine=player_record.tag_line,
                        current_price=current_price,
                        purchase_price=player.purchase_price,
                        shares=player.shares
                    )

                # Construct the holds list
                holds_list = [
                    Holds(
                        id=hold.id,
                        gameName=hold.player.game_name,
                        shares=hold.shares,
                        hold_deadline=hold.hold_deadline
                    )
                    for hold in holds
                ]

                # Construct the portfolio history list
                portfolio_history_list = [
                    PortfolioHistory(
                        id=history.id,
                        value=history.value,
                        date=history.date
                    )
                    for history in portfolio_history
                ]

                # Construct the transactions list
                transactions_list = [
                    Transaction(
                        id=transaction.id,
                        type=transaction.type,
                        gameName=db.query(Player).filter(Player.id == transaction.player_id).first().game_name,
                        shares=transaction.shares,
                        price=transaction.price,
                        transaction_date=transaction.transaction_date
                    )
                    for transaction in transactions
                ]

                # Append the league with portfolio to the list
                leagues_with_portfolios.append(
                    LeagueWithPortfolio(
                        league=League(
                            id=league.id,
                            name=league.name,
                            start_date=league.start_date,
                            end_date=league.end_date,
                            created_by=league.created_by,
                            type=league.type
                        ),
                        portfolio=PortfolioModel(
                            id=portfolio.id,
                            players=players_dict,
                            holds=holds_list
                        ),
                        portfolio_history=portfolio_history_list,
                        transactions=transactions_list,
                        one_day_change=None,
                        three_day_change=None,
                        balance=user_league.balance,
                        rank=user_league.rank
                    )
                )

            user_profile = UserProfile(
                username=user.username,
                leagues=leagues_with_portfolios,
                favorites=[],  # Adjust this to fetch actual favorites
                date_registered=user.date_registered,
                current_league_id=user.current_league_id
            )
            logging.debug(f"UserProfile: {user_profile}")
            return user_profile
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An error occurred")