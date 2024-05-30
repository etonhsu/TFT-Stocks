from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.db_models import League, User, Portfolio, UserLeagues
from app.core.token import get_user_from_token
from app.models.models import UserProfile

router = APIRouter()

@router.post("/create_league", status_code=status.HTTP_201_CREATED)
async def create_league(
    name: str = Body(...),
    length: int = Body(...),
    max_players: int = Body(None),
    password: str = Body(None),
    current_user: UserProfile = Depends(get_user_from_token),
    db: Session = Depends(get_db)
):
    try:
        # Fetch the user by their username to get the user ID
        user = db.query(User).filter(User.username == current_user.username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check for existing league with the same name (case-insensitive)
        existing_league = db.query(League).filter(func.lower(League.name) == func.lower(name)).first()
        if existing_league:
            raise HTTPException(status_code=400, detail="League name already exists")

        start_date = datetime.now(timezone.utc)
        end_date = start_date + timedelta(days=length)

        new_league = League(
            name=name,
            start_date=start_date,
            end_date=end_date,
            created_by=user.id,
            max_players=max_players,
            password=password,
            type='custom'
        )
        db.add(new_league)
        db.commit()
        db.refresh(new_league)

        # Create a new portfolio for the user in the created league
        new_portfolio = Portfolio(current_value=100000)
        db.add(new_portfolio)
        db.commit()
        db.refresh(new_portfolio)

        # Add the user to the user_leagues table
        user_league_entry = UserLeagues(
            user_id=user.id,
            league_id=new_league.id,
            portfolio_id=new_portfolio.id,
            balance=100000
        )
        db.add(user_league_entry)
        db.commit()

        return {"message": "League created successfully", "league_id": new_league.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
