from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
from app.utils.get_secret import get_secret  # Adjust the import path as necessary

# Fetch secrets from AWS Secrets Manager
secret_name = "tft-stocks-keys"
secrets = get_secret(secret_name)

# Extract the database URL from the secrets
DATABASE_URL = secrets["database_url"]

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for declarative class definitions
Base = declarative_base()

@contextmanager
def get_database_session():
    """Provide a transactional scope around a series of operations."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
