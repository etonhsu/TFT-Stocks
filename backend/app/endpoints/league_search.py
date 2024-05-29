# league_search.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.db_models import League

router = APIRouter()

@router.get("/search_leagues")
async def search_leagues(query: str, db: Session = Depends(get_db)):
    leagues = db.query(League).filter(League.name.ilike(f"%{query}%")).all()
    return [{"name": league.name, "requires_password": bool(league.password)} for league in leagues]
