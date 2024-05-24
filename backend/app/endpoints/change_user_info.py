from fastapi import APIRouter, HTTPException, Depends, status, Body
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.token import get_user_from_token
from app.db.database import get_db
from app.models.models import UserSelf, PasswordUpdateModel, UsernameChangeRequest
from app.models.db_models import User

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 setup (assuming you have token-based authentication in place)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/change_username")
async def change_username(request: UsernameChangeRequest, user_data: UserSelf = Depends(get_user_from_token), db: Session = Depends(get_db)):
    username_lower = request.newUsername.lower()
    # Find if new username already exists
    if db.query(User).filter(User.username == username_lower).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Update username
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.username = request.newUsername
    db.commit()

    return {"message": "Username updated successfully"}

@router.post("/change_password")
async def change_password(passwords: PasswordUpdateModel = Body(...), user_data: UserSelf = Depends(get_user_from_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Verify old password
    if not pwd_context.verify(passwords.oldPassword, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is incorrect")

    # Hash new password
    hashed_password = pwd_context.hash(passwords.newPassword)

    # Update password in database
    user.password = hashed_password
    db.commit()

    return {"message": "Password updated successfully"}
