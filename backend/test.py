from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.db.database import get_database_session
from app.models.db_models import League, User, Portfolio, UserLeagues

DEFAULT_BALANCE = 100000

def create_monthly_league():
    # Initialize the database session using the context manager
    with get_database_session() as db:
        try:
            # Check for existing league with the name "Monthly League 2"
            existing_league = db.query(League).filter(League.name == "Monthly League 2").first()
            if existing_league:
                raise Exception("League 'Monthly League 2' already exists")

            # Define league parameters
            name = "Monthly League 2"
            length = 30  # Assuming a monthly league runs for 30 days
            start_date = datetime.now(timezone.utc)
            end_date = start_date + timedelta(days=length)

            # Create the new league
            new_league = League(
                name=name,
                start_date=start_date,
                end_date=end_date,
                created_by=None,  # Assuming league creation is system-initiated
                type='custom'
            )
            db.add(new_league)
            db.commit()
            db.refresh(new_league)

            # Fetch all users
            users = db.query(User).all()

            for user in users:
                # Create a new portfolio for each user
                new_portfolio = Portfolio(current_value=DEFAULT_BALANCE)
                db.add(new_portfolio)
                db.commit()
                db.refresh(new_portfolio)

                # Create a new user_leagues entry for each user with the created portfolio
                new_user_league = UserLeagues(
                    user_id=user.id,
                    league_id=new_league.id,
                    portfolio_id=new_portfolio.id,
                    balance=DEFAULT_BALANCE,
                    rank=0
                )
                db.add(new_user_league)
                db.commit()

            return {"message": "Monthly League 2 created successfully and all users added", "league_id": new_league.id}
        except SQLAlchemyError as e:
            db.rollback()
            raise Exception(f"Database error occurred: {str(e)}")
        except Exception as e:
            db.rollback()
            raise Exception(f"An error occurred: {str(e)}")

# Usage example
if __name__ == "__main__":
    result = create_monthly_league()
    print(result)
