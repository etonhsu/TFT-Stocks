import jwt
from datetime import datetime, timedelta, timezone
import logging

from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from jwt import DecodeError, ExpiredSignatureError
from sqlalchemy.orm import Session

from app.db.database import get_database_session
from app.models.db_models import User
from app.models.models import UserProfile
from app.utils.get_secret import get_secret

secrets = get_secret('tft-stocks-keys')
key = secrets['secret_key']
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 180
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


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
    except ExpiredSignatureError as e:
        logging.error("Token expired: " + str(e))
        raise HTTPException(status_code=401, detail="Token expired")
    except DecodeError as e:
        logging.error("Token decode error: " + str(e))
        raise credentials_exception


def get_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_database_session)):
    try:
        # Assuming 'verify_token' extracts the username from the token
        username = verify_token(token, credentials_exception=HTTPException(status_code=401, detail="Invalid token"))

        # Fetch user data based on username from PostgreSQL
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserProfile(
            username=user.username,
            portfolio={},  # Adjust this to fetch actual portfolio data
            transactions=[],  # Adjust this to fetch actual transactions
            one_day_change=0.0,  # Calculate or fetch this value
            three_day_change=0.0,  # Calculate or fetch this value
            rank=user.rank,
            portfolio_history=[],  # Adjust this to fetch actual portfolio history
            balance=user.balance,
            favorites=[],  # Adjust this to fetch actual favorites
            date_registered=user.date_registered
        )
    except (DecodeError, ExpiredSignatureError) as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        # Generic exception catch to handle unexpected errors
        raise HTTPException(status_code=500, detail="An error occurred")
