from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.database import get_db
from app.models.db_models import Player, PlayerData
from app.models.pricing_model import price_model  # Assuming your pricing model is in app/models

router = APIRouter()

@router.get('/players/{gameName}/{tagLine}')
async def player_info(gameName: str, tagLine: str, db: Session = Depends(get_db)):
    try:
        # Fetch the player data from the database
        player = db.query(Player).filter(and_(Player.game_name == gameName, Player.tag_line == tagLine)).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        # Fetch the player data history
        player_data = db.query(PlayerData).filter(PlayerData.player_id == player.id).order_by(PlayerData.date).all()
        if not player_data:
            raise HTTPException(status_code=404, detail="Player data not found")

        # Extract date and league points from player data
        date_history = [str(data.date) for data in player_data]
        price_history = [price_model(data.league_points) for data in player_data]

        # Get the most recent date and ensure it's timezone-aware
        info_date = player_data[-1].date
        if info_date.tzinfo is None:
            info_date = info_date.replace(tzinfo=timezone.utc)

        # Convert date to string with microsecond precision
        utc_date = info_date.astimezone(timezone.utc).isoformat()

        return {
            'name': player.game_name,
            'price': price_history,
            'date': date_history,
            'date_updated': utc_date,
            '8 Hour Change': player.delta_8h,
            '24 Hour Change': player.delta_24h,
            '3 Day Change': player.delta_72h,
            'delist_date': player.delist_date  # This will be None if not present
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
