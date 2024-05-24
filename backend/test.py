from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.db_models import User, UserLeagues, Portfolio
from app.utils.get_secret import get_secret

# Database setup
DATABASE_URL = "postgresql+pg8000://etonhsu:K27AvlaPA6GYZ8NQ2tvt@tft-stocks.c9ooisyqkieb.us-west-2.rds.amazonaws.com:5432/tft-stocks"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def create_portfolios_for_users():
    session = Session()

    try:
        users = session.query(User).all()
        for user in users:
            # Create a new portfolio
            new_portfolio = Portfolio(current_value=0)
            session.add(new_portfolio)
            session.flush()  # Flush to get the new portfolio ID

            # Create a new user_leagues entry
            new_user_leagues = UserLeagues(
                user_id=user.id,
                league_id=2,  # Default league
                portfolio_id=new_portfolio.id,
                balance=100000,  # Default balance
                rank=0  # Default rank
            )
            session.add(new_user_leagues)
            print(f'Created default portfolio and user_leagues for user {user.username}')

        session.commit()

    except Exception as e:
        session.rollback()
        print(f"Error creating portfolios and user_leagues: {e}")

    finally:
        session.close()

if __name__ == "__main__":
    create_portfolios_for_users()
