from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from sqlalchemy.orm import Session
from app.core.token import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db.database import get_database_session
from app.models.db_models import User
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

@router.post('/login')
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with get_database_session() as db:
        username = form_data.username
        user = db.query(User).filter(User.username == username).first()

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Username not found. Please register.')

        # Verify password
        if not pwd_context.verify(form_data.password, user.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect password')

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={'sub': user.username}, expires_delta=access_token_expires)
        return {'access_token': access_token, 'token_type': 'bearer'}
