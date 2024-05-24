from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.db_models import User, Player

router = APIRouter()


@router.get('/search/players/{query}')
async def search_players(query: str, db: Session = Depends(get_db)):
    query_lower = query.lower()
    players = db.query(Player).filter(func.lower(Player.game_name_lower) == query_lower).all()
    if not players:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Player not found')

    # Create a list of players with their gameName and tagLine
    player_list = [{'gameName': player.game_name, 'tagLine': player.tag_line} for player in players]

    return player_list


@router.get('/search/users/{query}')
async def search_users(query: str, db: Session = Depends(get_db)):
    query_lower = query.lower()
    user = db.query(User).filter(func.lower(User.username) == query_lower).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return {'username': user.username}
