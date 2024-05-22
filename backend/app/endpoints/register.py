from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, timezone
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.token import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db.database import get_database_session
from app.models.db_models import User, UserLeagues
from app.models.models import UserLeague

router = APIRouter()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

SET_LEAGUE_ID = 2  # The ID of the "Set League"

@router.post('/register')
async def register(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_database_session)):
    username = form_data.username

    user = db.query(User).filter(User.username == username).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already registered')

    hashed_password = pwd_context.hash(form_data.password)
    set_league_id = 2  # Assuming 2 is the ID for the set_league
    new_user = User(
        username=form_data.username,
        password=hashed_password,
        balance=100000,
        date_registered=datetime.now(timezone.utc),
        rank=0,
        current_league_id=set_league_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    user_league = UserLeague(user_id=new_user.id, league_id=set_league_id)
    db.add(user_league)
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={'sub': form_data.username}, expires_delta=access_token_expires)
    return {'access_token': access_token, 'token_type': 'bearer'}

