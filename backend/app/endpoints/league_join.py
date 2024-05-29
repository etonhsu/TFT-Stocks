from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.db_models import User, UserLeagues, League, Portfolio
from app.models.models import LeagueJoinRequest
from app.core.token import get_user_from_token

router = APIRouter()

@router.post("/join_league")
async def join_league(request: LeagueJoinRequest, current_user: User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    # Fetch the user by their username to get the user ID
    user = db.query(User).filter(User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check the number of leagues the user is currently enrolled in
    league_count = db.query(UserLeagues).filter(UserLeagues.user_id == user.id).count()
    if league_count >= 5:
        raise HTTPException(status_code=400, detail="User is already enrolled in the maximum number of leagues")

    # Fetch the league by its name
    league = db.query(League).filter(League.name == request.name).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    # Check if the league requires a password and if the provided password is correct
    if league.password and league.password != request.password:
        raise HTTPException(status_code=403, detail="Incorrect password for the league")

    # Check if the league has a max player limit and if it's already full
    if league.max_players and league.player_count >= league.max_players:
        raise HTTPException(status_code=400, detail="The league is already full")

    # Create a new portfolio for the user for the new league
    new_portfolio = Portfolio(current_value=100000.0)
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)

    # Add the user to the league
    new_user_league = UserLeagues(
        user_id=user.id,
        league_id=league.id,
        portfolio_id=new_portfolio.id,
        balance=100000.0
    )
    db.add(new_user_league)

    # Update the player count in the league
    league.player_count += 1

    db.commit()

    return {"message": "Successfully joined the league"}
