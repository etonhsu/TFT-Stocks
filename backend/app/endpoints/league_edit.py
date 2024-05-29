from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.db_models import League, User
from app.models.models import LeagueOverview, LeagueEdit, UserProfile
from app.core.token import get_user_from_token

router = APIRouter()

@router.put("/leagues/{league_name}")
async def edit_league(league_name: str, league: LeagueEdit, current_user: UserProfile = Depends(get_user_from_token),
                      db: Session = Depends(get_db)):
    try:
        # Fetch the user's full record to get the ID
        user = db.query(User).filter(User.username == current_user.username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Decode the league name if it's URL-encoded
        from urllib.parse import unquote
        league_name = unquote(league_name)

        # Log the league name being queried
        print(f"Searching for league with name: {league_name}")

        # Fetch the league
        league_name = league_name.strip().lower()
        league_db = db.query(League).filter(League.name.ilike(f'%{league_name}%')).first()
        if not league_db:
            raise HTTPException(status_code=404, detail="League not found")

        # Check if the current user is the creator of the league
        if league_db.created_by != user.id:
            raise HTTPException(status_code=403, detail="You are not the creator of this league")

        # Update the league details
        if league.name is not None:
            league_db.name = league.name
        if league.max_players is not None:
            league_db.max_players = league.max_players
        if league.password is not None:
            league_db.password = league.password

        db.commit()
        db.refresh(league_db)

    except HTTPException as e:
        raise e
    except Exception as e:
        # Log the error details
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))
