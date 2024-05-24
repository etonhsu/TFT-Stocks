from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, timezone
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.token import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db.database import get_database_session
from app.models.db_models import User, UserLeagues, Portfolio

router = APIRouter()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

SET_LEAGUE_ID = 2  # The ID of the "Set League"
DEFAULT_BALANCE = 100000  # Default balance for new users

@router.post('/register')
async def register(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_database_session)):
    username = form_data.username

    user = db.query(User).filter(User.username == username).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already registered')

    hashed_password = pwd_context.hash(form_data.password)
    new_user = User(
        username=form_data.username,
        password=hashed_password,
        date_registered=datetime.now(timezone.utc),
        current_league_id=SET_LEAGUE_ID
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create a new portfolio for the user
    new_portfolio = Portfolio(current_value=0)
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)

    # Create a new user_leagues entry for the user with the created portfolio
    new_user_league = UserLeagues(
        user_id=new_user.id,
        league_id=SET_LEAGUE_ID,
        portfolio_id=new_portfolio.id,
        balance=DEFAULT_BALANCE,
        rank=0
    )
    db.add(new_user_league)
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={'sub': form_data.username}, expires_delta=access_token_expires)
    return {'access_token': access_token, 'token_type': 'bearer'}
