from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.token import get_user_from_token
from app.db.database import get_db
from app.models.models import FavoritesEntry, UserProfile, ToggleFavoriteRequest
from app.models.pricing_model import price_model
from app.models.db_models import User, Favorite, Player, PlayerData

router = APIRouter()

@router.post('/toggle_favorites', response_model=bool)
async def toggle_favorites(request: ToggleFavoriteRequest, current_user: UserProfile = Depends(get_user_from_token), db: Session = Depends(get_db)):
    gameName = request.gameName
    tagLine = request.tagLine

    player = db.query(Player).filter(and_(Player.game_name == gameName, Player.tag_line == tagLine)).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    user = db.query(User).filter(User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    favorite = db.query(Favorite).filter(and_(Favorite.user_id == user.id, Favorite.player_id == player.id)).first()

    if favorite:
        db.delete(favorite)
        db.commit()
        return False
    else:
        latest_player_data = db.query(PlayerData).filter(PlayerData.player_id == player.id).order_by(PlayerData.date.desc()).first()
        if not latest_player_data:
            raise HTTPException(status_code=404, detail="Player data not found")

        favorite_entry = Favorite(
            user_id=user.id,
            player_id=player.id
        )
        db.add(favorite_entry)
        db.commit()
        return True

@router.get('/favorite_status/{gameName}/{tagLine}', response_model=bool)
async def get_favorite_status(gameName: str, tagLine: str, current_user: UserProfile = Depends(get_user_from_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    player = db.query(Player).filter(and_(Player.game_name == gameName, Player.tag_line == tagLine)).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    favorite = db.query(Favorite).filter(and_(Favorite.user_id == user.id, Favorite.player_id == player.id)).first()
    return favorite is not None

