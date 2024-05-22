from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from decimal import Decimal

from app.models.models import TransactionRequest, Transaction as TransactionModel, UserProfile, Holds
from app.models.db_models import User, Player, Portfolio, PortfolioPlayer, PortfolioHold, Transaction, PlayerData, UserLeagues
from app.db.database import get_database_session
from app.core.token import get_user_from_token
from app.models.pricing_model import price_model

router = APIRouter()

@router.post('/players/{gameName}/{tagLine}/{transaction_type}')
async def add_transaction(
        gameName: str,
        tagLine: str,
        transaction_type: str,
        transaction_data: TransactionRequest,
        user: UserProfile = Depends(get_user_from_token),
        db: Session = Depends(get_database_session)
):
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    if transaction_type not in ['buy', 'sell']:
        raise HTTPException(status_code=400, detail='Invalid transaction type')

    shares = transaction_data.shares
    player = db.query(Player).filter(and_(Player.game_name == gameName, Player.tag_line == tagLine)).first()
    if not player:
        raise HTTPException(status_code=400, detail='Invalid gameName or tagLine')

    latest_player_data = db.query(PlayerData).filter(PlayerData.player_id == player.id).order_by(PlayerData.date.desc()).first()
    if not latest_player_data:
        raise HTTPException(status_code=400, detail='No league points data available for this player')

    price = Decimal(price_model(latest_player_data.league_points))
    total = shares * price

    user_record = db.query(User).filter(User.username == user.username).first()
    if not user_record:
        raise HTTPException(status_code=404, detail='User not found in database')

    # Fetch the current league portfolio for the user
    user_league = db.query(UserLeagues).filter(and_(UserLeagues.user_id == user_record.id, UserLeagues.league_id == user_record.current_league_id)).first()
    if not user_league:
        raise HTTPException(status_code=404, detail='User not associated with current league')

    portfolio = db.query(Portfolio).filter(Portfolio.id == user_league.portfolio_id).first()
    if not portfolio:
        portfolio = Portfolio(current_value=0)
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

        user_league.portfolio_id = portfolio.id
        db.commit()

    portfolio_player = db.query(PortfolioPlayer).filter(and_(PortfolioPlayer.portfolio_id == portfolio.id, PortfolioPlayer.player_id == player.id)).first()

    if transaction_type == 'buy':
        if user_record.balance < total:
            raise HTTPException(status_code=400, detail='Insufficient Balance')

        user_record.balance -= total

        if portfolio_player:
            new_purchase_price = ((portfolio_player.purchase_price * portfolio_player.shares) + (price * shares)) / (portfolio_player.shares + shares)
            portfolio_player.purchase_price = new_purchase_price
            portfolio_player.shares += shares
        else:
            new_portfolio_player = PortfolioPlayer(
                portfolio_id=portfolio.id,
                player_id=player.id,
                purchase_price=price,
                shares=shares
            )
            db.add(new_portfolio_player)

        new_transaction = Transaction(
            portfolio_id=portfolio.id,
            type=transaction_type,
            player_id=player.id,
            shares=shares,
            price=price,
            transaction_date=datetime.now(timezone.utc)
        )
        db.add(new_transaction)

        new_hold_deadline = datetime.now(timezone.utc) + timedelta(hours=3)
        print(new_hold_deadline)
        new_hold = PortfolioHold(
            portfolio_id=portfolio.id,
            player_id=player.id,
            hold_deadline=new_hold_deadline,
            shares=shares
        )
        db.add(new_hold)

    elif transaction_type == 'sell':
        if not portfolio_player or portfolio_player.shares < shares:
            raise HTTPException(status_code=400, detail='Insufficient Shares')

        total_holds = db.query(func.sum(PortfolioHold.shares)).filter(
            and_(PortfolioHold.portfolio_id == portfolio.id,
                 PortfolioHold.player_id == player.id,
                 PortfolioHold.hold_deadline > datetime.now(timezone.utc))
        ).scalar() or 0
        free_shares = portfolio_player.shares - total_holds
        if shares > free_shares:
            raise HTTPException(status_code=400, detail='Insufficient Free Shares')

        user_record.balance += total
        portfolio_player.shares -= shares
        if portfolio_player.shares == 0:
            db.delete(portfolio_player)

        new_transaction = Transaction(
            portfolio_id=portfolio.id,
            type=transaction_type,
            player_id=player.id,
            shares=shares,
            price=price,
            transaction_date=datetime.now(timezone.utc)
        )
        db.add(new_transaction)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Failed to update user data in the database: {str(e)}')

    return {"message": "Transaction successful"}
