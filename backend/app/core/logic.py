from datetime import timezone
from typing import List

from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func

from app.models.db_models import User, PlayerData, Transaction as TransactionModel, PortfolioHistory, Player, Portfolio
from app.models.models import LeaderboardEntry, Transaction, UserPublic, PortfolioLeaderboardEntry
from app.db.database import get_database_session
from app.models.pricing_model import price_model


def fetch_leaderboard_entries(lead_type: str, page: int = 0, limit: int = 100, db: Session = Depends(get_database_session)) -> List[LeaderboardEntry]:
    A = 1.75
    B = 0.00698
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
            sort_field = lead_type.replace('neg_', '')  # Remove 'neg_' prefix for correct field name
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
            lp_value = ((item.league_points ** A) * B) + 10
            player = item.player

            entry = LeaderboardEntry(
                gameName=player.game_name,
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


def fetch_portfolio_leaderboard(page: int = 0, limit: int = 100, db: Session = Depends(get_database_session)) -> List[PortfolioLeaderboardEntry]:
    skip = page * limit

    try:
        query = db.query(User.username, Portfolio.current_value).join(Portfolio).order_by(desc(Portfolio.current_value)).offset(skip).limit(limit)

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


# def fetch_recent_transactions(user: UserPublic = Depends(get_user_from_token), db: Session = Depends(get_database_session)) -> List[Transaction]:
#     try:
#         user_data = db.query(User).filter(User.username == user.username).first()
#
#         transactions = db.query(TransactionModel).filter(TransactionModel.user_id == user_data.id).all()
#         recent_transactions = []
#         for t in transactions:
#             t.transaction_date = t.transaction_date.replace(tzinfo=timezone.utc)  # Ensure the datetime is timezone-aware
#             recent_transactions.append(Transaction(**t.__dict__))
#
#         for transaction in recent_transactions:
#             transaction.price = price_model(transaction.price)
#
#         # Reversing the list of transactions
#         list_transactions = list(recent_transactions)
#         return list_transactions
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Failed to fetch recent transactions: {str(e)}')
