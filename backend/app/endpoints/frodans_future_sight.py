from datetime import timezone

from fastapi import HTTPException, Depends, APIRouter
from sqlalchemy import and_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.models import FutureSightCreate, UserProfile
from app.models.db_models import User, Player, FutureSight, FutureSightPick, FutureSightQuestion, RegionalsPlayers, \
    RegionalsNonna, RegionalsData, PlayerData
from app.db.database import get_db
from app.core.token import get_user_from_token

router = APIRouter()


@router.post('/ffs')
async def create_future_sight(
        future_sight_data: FutureSightCreate,
        user: UserProfile = Depends(get_user_from_token),
        db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    # Check if user exists in the database
    user_record = db.query(User).filter(User.username == user.username).first()
    if not user_record:
        raise HTTPException(status_code=404, detail='User not found in database')

    try:
        # Create a new FutureSight entry
        new_future_sight = FutureSight(
            user_id=user_record.id,
            current_points=0
        )
        db.add(new_future_sight)
        db.commit()
        db.refresh(new_future_sight)

        # Create FutureSightPick entries
        for pick in future_sight_data.picks:
            new_pick = FutureSightPick(
                future_sight_id=new_future_sight.id,
                player_id=pick.player_id,
                rank=pick.rank,
                table_name=pick.table_name  # Ensure table_name is provided
            )
            db.add(new_pick)

        # Create FutureSightQuestion entries
        for question in future_sight_data.questions:
            new_question = FutureSightQuestion(
                future_sight_id=new_future_sight.id,
                question=question.question,
                answer=question.answer
            )
            db.add(new_question)

        db.commit()
        print(f'FutureSight entry created for user {user.username}')
        return {"message": "FutureSight and related entries created successfully"}

    except HTTPException as e:
        db.rollback()
        print(f"FutureSight creation failed for user {user.username}: {e.detail}")
        raise e

    except Exception as e:
        db.rollback()
        print(f"Unexpected error during FutureSight creation for user {user.username}: {str(e)}")
        raise HTTPException(status_code=500, detail=f'Failed to create FutureSight: {str(e)}')


@router.get('/ffs/players')
async def get_regionals_players(db: Session = Depends(get_db)):
    try:
        # Get players from both tables
        regionals_players = db.query(RegionalsPlayers).all()
        player_details = []

        for rp in regionals_players:
            if rp.table_name == 'players':
                player = db.query(Player).filter(Player.id == rp.player_id).first()
            elif rp.table_name == 'regionals_nonna':
                player = db.query(RegionalsNonna).filter(RegionalsNonna.id == rp.player_id).first()

            if player:
                player_details.append({
                    'id': player.id,
                    'game_name': player.game_name,
                    'tag_line': player.tag_line,
                    'table_name': rp.table_name
                })

        return player_details
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error")



@router.get('/ffs/players/{gameName}/{tagLine}')
async def player_info(gameName: str, tagLine: str, db: Session = Depends(get_db)):
    try:
        # Determine which table to fetch from
        regionals_player = db.query(RegionalsPlayers).filter(
            and_(RegionalsPlayers.table_name == 'regionals_nonna', RegionalsPlayers.player_id == Player.id)).first()

        if regionals_player:
            # Fetch the player data from the regionals_nonna table
            player = db.query(RegionalsNonna).filter(
                and_(RegionalsNonna.game_name == gameName, RegionalsNonna.tag_line == tagLine)).first()
            if not player:
                raise HTTPException(status_code=404, detail="Player not found")

            # Fetch the player data history from regionals_data table
            player_data = db.query(RegionalsData).filter(RegionalsData.player_id == player.id).order_by(
                RegionalsData.date).all()
            if not player_data:
                raise HTTPException(status_code=404, detail="Player data not found")
        else:
            # Fetch the player data from the players table
            player = db.query(Player).filter(and_(Player.game_name == gameName, Player.tag_line == tagLine)).first()
            if not player:
                raise HTTPException(status_code=404, detail="Player not found")

            # Fetch the player data history from player_data table
            player_data = db.query(PlayerData).filter(PlayerData.player_id == player.id).order_by(PlayerData.date).all()
            if not player_data:
                raise HTTPException(status_code=404, detail="Player data not found")

        # Extract date and league points from player data
        date_history = [str(data.date) for data in player_data]
        price_history = [data.league_points for data in player_data]

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


@router.get('/ffs/has_future_sight')
async def has_future_sight(
        user: UserProfile = Depends(get_user_from_token),
        db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    user_record = db.query(User).filter(User.username == user.username).first()
    if not user_record:
        raise HTTPException(status_code=404, detail='User not found in database')

    future_sight_entry = db.query(FutureSight).filter(FutureSight.user_id == user_record.id).first()

    return {"hasFutureSight": bool(future_sight_entry)}


@router.get('/ffs/user_future_sight')
async def get_user_future_sight(user: UserProfile = Depends(get_user_from_token), db: Session = Depends(get_db)):
    user_record = db.query(User).filter(User.username == user.username).first()
    if not user_record:
        raise HTTPException(status_code=404, detail='User not found')

    future_sight = db.query(FutureSight).filter(FutureSight.user_id == user_record.id).first()
    if not future_sight:
        return {"ranking": [], "questions": []}

    picks = []
    for pick in future_sight.picks:
        player = None
        if pick.table_name == 'players':
            player = db.query(Player).filter(Player.id == pick.player_id).first()
        elif pick.table_name == 'regionals_nonna':
            player = db.query(RegionalsNonna).filter(RegionalsNonna.id == pick.player_id).first()

        if player:
            picks.append({
                "player_id": pick.player_id,
                "rank": pick.rank,
                "game_name": player.game_name,
                "tag_line": player.tag_line,
                "table_name": pick.table_name
            })

    questions = [{"question": q.question, "answer": q.answer} for q in future_sight.questions]

    return {"ranking": picks, "questions": questions}

