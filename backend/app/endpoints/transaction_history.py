from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List

from app.models.models import UserPublic, Transaction as TransactionModel
from app.core.token import get_user_from_token
from app.db.database import get_db
from app.core.logic import fetch_recent_transactions

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

@router.get('/transaction_history', response_model=List[TransactionModel])
async def transaction_history(
    current_user: UserPublic = Depends(get_user_from_token),
    db: Session = Depends(get_db)
):
    transactions = fetch_recent_transactions(current_user, db)
    return transactions
