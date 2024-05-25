from datetime import timezone
from typing import List
import logging

from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func

from app.core.token import get_user_from_token
from app.models.db_models import User, PlayerData, Transaction, PortfolioHistory, Player, Portfolio, \
    UserLeagues
from app.models.models import LeaderboardEntry, Transaction as TransactionModel, TransactionWithTagLine, UserPublic, PortfolioLeaderboardEntry
from app.db.database import get_database_session, get_db
from app.models.pricing_model import price_model

logger = logging.getLogger(__name__)


from typing import List
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc

from app.models.db_models import PlayerData, Player
from app.models.models import LeaderboardEntry
from app.db.database import get_database_session

def fetch_leaderboard_entries(lead_type: str, page: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[LeaderboardEntry]:
    skip = page * limit

    try:
        # Map lead_type to actual fields and corresponding model
        sort_fields_map = {
            'lp': ('league_points', PlayerData),
            'delta_8h': ('delta_8h', Player),
            'delta_24h': ('delta_24h', Player),
            'delta_72h': ('delta_72h', Player)
        }

        if 'neg_' in lead_type:
            sort_field = lead_type.replace('neg_', 'delta_')  # Remove 'neg_' prefix for correct field name
            sort_direction = asc  # Sort ascending for 'neg_' versions
        else:
            sort_field = lead_type
            sort_direction = desc  # Sort descending for normal cases

        if sort_field not in sort_fields_map:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid leaderboard type")

        sort_field_actual, model = sort_fields_map[sort_field]

        # Subquery to get the latest PlayerData entry for each player
        subquery = db.query(
            PlayerData.player_id,
            func.max(PlayerData.date).label('max_date')
        ).group_by(PlayerData.player_id).subquery()

        # Query to get the latest PlayerData entries joined with Player
        query = db.query(PlayerData).join(Player).join(
            subquery,
            (PlayerData.player_id == subquery.c.player_id) &
            (PlayerData.date == subquery.c.max_date)
        )

        if model == PlayerData:
            query = query.order_by(sort_direction(getattr(PlayerData, sort_field_actual)))
        else:
            query = query.order_by(sort_direction(getattr(Player, sort_field_actual)))

        player_data = query.offset(skip).limit(limit).all()

        entries = []
        for index, item in enumerate(player_data):
            lp_value = price_model(item.league_points)
            player = item.player

            entry = LeaderboardEntry(
                gameName=player.game_name,
                tagLine=player.tag_line,
                lp=lp_value,
                delta_8h=player.delta_8h,
                delta_24h=player.delta_24h,
                delta_72h=player.delta_72h,
                rank=index + 1 + skip
            )
            entries.append(entry)

        return entries
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Failed to fetch leaderboard data: {str(e)}')


def fetch_portfolio_leaderboard(page: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[PortfolioLeaderboardEntry]:
    skip = page * limit

    try:
        # Explicitly define the join condition
        query = (
            db.query(User.username, Portfolio.current_value)
            .join(UserLeagues, User.id == UserLeagues.user_id)
            .join(Portfolio, UserLeagues.portfolio_id == Portfolio.id)
            .order_by(desc(Portfolio.current_value))
            .offset(skip)
            .limit(limit)
        )

        user_portfolios = query.all()
        entries = []
        for index, (username, current_value) in enumerate(user_portfolios):
            entry = PortfolioLeaderboardEntry(
                username=username,
                value=current_value,
                rank=index + 1 + skip
            )
            entries.append(entry)

        return entries
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Failed to fetch portfolio leaderboard data: {str(e)}')


def fetch_recent_transactions(user: UserPublic, db: Session) -> List[TransactionWithTagLine]:
    try:
        user_record = db.query(User).filter(User.username == user.username).first()
        if not user_record:
            logger.error(f"User not found: {user.username}")
            raise HTTPException(status_code=404, detail='User not found')

        user_league = db.query(UserLeagues).filter(
            UserLeagues.user_id == user_record.id,
            UserLeagues.league_id == user_record.current_league_id
        ).first()
        if not user_league:
            logger.error(f"User not associated with current league: {user.username}")
            raise HTTPException(status_code=404, detail='User not associated with current league')

        transactions = db.query(Transaction).filter(Transaction.portfolio_id == user_league.portfolio_id).all()
        if not transactions:
            logger.info(f"No transactions found for user: {user.username}")

        recent_transactions = []
        for t in transactions:
            player = db.query(Player).filter(Player.id == t.player_id).first()
            if not player:
                logger.error(f"Player not found for player_id: {t.player_id}")
                continue

            logger.debug(f"Fetched player data: {player}")
            logger.debug(f"Player game_name: {player.game_name}, Player tag_line: {player.tag_line}")

            t.transaction_date = t.transaction_date.replace(tzinfo=timezone.utc)  # Ensure the datetime is timezone-aware

            # Directly use the Pydantic model
            transaction = TransactionWithTagLine(
                id=t.id,
                type=t.type,
                gameName=player.game_name,  # Include gameName
                tagLine=player.tag_line,  # Include tagLine
                shares=t.shares,
                price=float(t.price),  # Convert Decimal to float
                transaction_date=t.transaction_date,
            )
            recent_transactions.append(transaction)

        # Reversing the list of transactions to maintain the correct order
        list_transactions = list(recent_transactions)[::-1]
        return list_transactions
    except HTTPException as e:
        logger.error(f"HTTPException: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Failed to fetch recent transactions: {str(e)}')