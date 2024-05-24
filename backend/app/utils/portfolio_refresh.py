from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_database_session
from app.models.db_models import User, Player, PlayerData, PortfolioPlayer, PortfolioHold, Transaction, PortfolioHistory as DBPortfolioHistory
from app.models.models import UserProfile, Player as PlayerModel, Holds, Transaction as TransactionModel, PortfolioHistory
from app.models.pricing_model import price_model


def portfolio_refresh(user: UserProfile):
    with get_database_session() as db:
        user_data = db.query(User).filter(User.username == user.username).first()
        if not user_data:
            raise HTTPException(status_code=404, detail='User not found')

        for league_with_portfolio in user.leagues:
            portfolio_players = db.query(PortfolioPlayer).join(Player).filter(PortfolioPlayer.portfolio_id == league_with_portfolio.portfolio.id).all()
            players = {}
            for pp in portfolio_players:
                player_data = db.query(PlayerData).filter(PlayerData.player_id == pp.player_id).order_by(PlayerData.date.desc()).first()
                current_price = price_model(player_data.league_points) if player_data else pp.purchase_price
                player = db.query(Player).filter(Player.id == pp.player_id).first()
                players[player.game_name] = PlayerModel(
                    name=player.game_name,
                    tagLine=player.tag_line,
                    current_price=current_price,
                    purchase_price=pp.purchase_price,
                    shares=pp.shares
                )

            holds = db.query(PortfolioHold).filter(PortfolioHold.portfolio_id == league_with_portfolio.portfolio.id).all()
            holds_list = [
                Holds(
                    id=hold.id,
                    gameName=hold.player.game_name,
                    shares=hold.shares,
                    hold_deadline=hold.hold_deadline
                )
                for hold in holds
            ]

            portfolio_history = db.query(DBPortfolioHistory).filter(DBPortfolioHistory.portfolio_id == league_with_portfolio.portfolio.id).all()
            portfolio_history_list = [
                PortfolioHistory(
                    id=history.id,
                    value=history.value,
                    date=history.date
                )
                for history in portfolio_history
            ]

            league_with_portfolio.portfolio.players = players
            league_with_portfolio.portfolio.holds = holds_list
            league_with_portfolio.portfolio_history = portfolio_history_list

    return user

