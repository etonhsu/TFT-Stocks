from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+pg8000://etonhsu:K27AvlaPA6GYZ8NQ2tvt@tft-stocks.c9ooisyqkieb.us-west-2.rds.amazonaws.com:5432/tft-stocks"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
metadata = MetaData()

def delete_all_data():
    connection = engine.connect()
    transaction = connection.begin()
    try:
        metadata.reflect(bind=engine)
        for table in reversed(metadata.sorted_tables):
            connection.execute(table.delete())
        transaction.commit()
    except Exception as e:
        transaction.rollback()
        print(f"Error occurred: {str(e)}")
    finally:
        connection.close()

if __name__ == "__main__":
    delete_all_data()
