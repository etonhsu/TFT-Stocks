from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.token import get_user_from_token
from app.db.database import get_db
from app.models.models import UserProfile, FavoritesEntry, FavoritesResponse
from app.models.db_models import User, Favorite, Player

router = APIRouter()

@router.get('/favorites', response_model=FavoritesResponse)
async def get_favorites(current_user: UserProfile = Depends(get_user_from_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    favorites = []
    favorite_entries = db.query(Favorite).filter(Favorite.user_id == user.id).all()

    for entry in favorite_entries:
        player = db.query(Player).filter(Player.id == entry.player_id).first()
        if player:
            fav_entry = FavoritesEntry(
                player_id=entry.player_id,
                game_name=player.game_name,
                tag_line=player.tag_line
            )
            favorites.append(fav_entry)

    return FavoritesResponse(favorites=favorites)
