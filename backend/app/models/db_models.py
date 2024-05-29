from sqlalchemy import create_engine, Column, Integer, String, Date, DateTime, ForeignKey, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True)
    password = Column(String(255))
    date_registered = Column(DateTime(timezone=True))
    current_league_id = Column(Integer, ForeignKey('leagues.id'))

    user_leagues = relationship('UserLeagues', back_populates='user')
    favorites = relationship('Favorite', back_populates='user')


class Player(Base):
    __tablename__ = 'players'
    id = Column(Integer, primary_key=True, autoincrement=True)
    puuid = Column(String(100), unique=True)
    summoner_id = Column(String(100), unique=True)
    game_name = Column(String(50))
    game_name_lower = Column(String(50))
    tag_line = Column(String(10))
    delta_8h = Column(DECIMAL)
    delta_24h = Column(DECIMAL)
    delta_72h = Column(DECIMAL)
    delist_date = Column(DateTime(timezone=True))

    player_data = relationship('PlayerData', back_populates='player')
    portfolio_players = relationship('PortfolioPlayer', back_populates='player')
    portfolio_holds = relationship('PortfolioHold', back_populates='player')
    transactions = relationship('Transaction', back_populates='player')
    favorites = relationship('Favorite', back_populates='player')


class PlayerData(Base):
    __tablename__ = 'player_data'
    id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey('players.id'))
    date = Column(DateTime(timezone=True))
    league_points = Column(Integer)

    player = relationship('Player', back_populates='player_data')


class League(Base):
    __tablename__ = 'leagues'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50))
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    player_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    password = Column(String(255), nullable=True)
    max_players = Column(Integer, nullable=True)
    type = Column(String(50))

    user_leagues = relationship('UserLeagues', back_populates='league')


class UserLeagues(Base):
    __tablename__ = 'user_leagues'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    league_id = Column(Integer, ForeignKey('leagues.id'))
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'))
    rank = Column(Integer)
    balance = Column(DECIMAL)  # Add balance attribute

    user = relationship('User', back_populates='user_leagues')
    league = relationship('League', back_populates='user_leagues')
    portfolio = relationship('Portfolio', back_populates='user_leagues')


class Portfolio(Base):
    __tablename__ = 'portfolios'
    id = Column(Integer, primary_key=True, autoincrement=True)
    current_value = Column(DECIMAL)

    user_leagues = relationship('UserLeagues', back_populates='portfolio')
    portfolio_players = relationship('PortfolioPlayer', back_populates='portfolio')
    portfolio_holds = relationship('PortfolioHold', back_populates='portfolio')
    portfolio_history = relationship('PortfolioHistory', back_populates='portfolio')
    transactions = relationship('Transaction', back_populates='portfolio')


class PortfolioPlayer(Base):
    __tablename__ = 'portfolio_players'
    id = Column(Integer, primary_key=True, autoincrement=True)
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'))
    player_id = Column(Integer, ForeignKey('players.id'))
    purchase_price = Column(DECIMAL)
    shares = Column(Integer)

    portfolio = relationship('Portfolio', back_populates='portfolio_players')
    player = relationship('Player', back_populates='portfolio_players')


class PortfolioHold(Base):
    __tablename__ = 'portfolio_holds'
    id = Column(Integer, primary_key=True, autoincrement=True)
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'))
    player_id = Column(Integer, ForeignKey('players.id'))
    hold_deadline = Column(DateTime(timezone=True))
    shares = Column(Integer)

    portfolio = relationship('Portfolio', back_populates='portfolio_holds')
    player = relationship('Player', back_populates='portfolio_holds')


class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(10))
    player_id = Column(Integer, ForeignKey('players.id'))
    shares = Column(Integer)
    price = Column(DECIMAL)
    transaction_date = Column(DateTime(timezone=True))
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'))

    portfolio = relationship('Portfolio', back_populates='transactions')
    player = relationship('Player', back_populates='transactions')


class PortfolioHistory(Base):
    __tablename__ = 'portfolio_history'
    id = Column(Integer, primary_key=True, autoincrement=True)
    value = Column(DECIMAL)
    date = Column(DateTime(timezone=True))
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'))

    portfolio = relationship('Portfolio', back_populates='portfolio_history')


class Favorite(Base):
    __tablename__ = 'favorites'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    player_id = Column(Integer, ForeignKey('players.id'))

    user = relationship('User', back_populates='favorites')
    player = relationship('Player', back_populates='favorites')
