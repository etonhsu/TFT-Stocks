from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.models.models import UserProfile
from app.core.token import get_user_from_token
from app.utils.portfolio_change import portfolio_change
from app.utils.portfolio_refresh import portfolio_refresh

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

@router.get('/dashboard', response_model=UserProfile)
async def read_dashboard(current_user: UserProfile = Depends(get_user_from_token)):
    try:
        refreshed_user_data = portfolio_refresh(current_user)
        updated_user_data = portfolio_change(refreshed_user_data)
    except Exception as e:
        print(f"Error processing dashboard data: {e}")
        raise HTTPException(status_code=500, detail="Error processing dashboard data")
    return updated_user_data  # Ensure you return the updated data
