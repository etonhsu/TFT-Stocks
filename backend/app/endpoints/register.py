from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, timezone
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.token import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db.database import get_db
from app.models.db_models import User, UserLeagues, Portfolio, League

router = APIRouter()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

DEFAULT_BALANCE = 100000  # Default balance for new users

@router.post('/register')
async def register(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    username = form_data.username

    user = db.query(User).filter(User.username == username).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already registered')

    hashed_password = pwd_context.hash(form_data.password)
    new_user = User(
        username=form_data.username,
        password=hashed_password,
        date_registered=datetime.now(timezone.utc),
        current_league_id=None  # Initialize with None, will be updated after adding to leagues
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Fetch server leagues
    server_leagues = db.query(League).filter(League.type == 'server').all()

    if not server_leagues:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='No server leagues found')

    for league in server_leagues:
        # Create a new portfolio for the user
        new_portfolio = Portfolio(current_value=100000)
        db.add(new_portfolio)
        db.commit()
        db.refresh(new_portfolio)

        # Create a new user_leagues entry for the user with the created portfolio
        new_user_league = UserLeagues(
            user_id=new_user.id,
            league_id=league.id,
            portfolio_id=new_portfolio.id,
            balance=DEFAULT_BALANCE,
            rank=0
        )
        db.add(new_user_league)
        db.commit()

    # Set the user's current_league_id to the first server league
    new_user.current_league_id = server_leagues[0].id
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={'sub': form_data.username}, expires_delta=access_token_expires)
    return {'access_token': access_token, 'token_type': 'bearer'}
