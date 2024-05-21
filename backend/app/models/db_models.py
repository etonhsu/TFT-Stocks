from sqlalchemy import create_engine, Column, Integer, String, Date, DateTime, ForeignKey, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True)
    password = Column(String)
    balance = Column(DECIMAL)
    rank = Column(Integer)
    date_registered = Column(Date)

    user_leagues = relationship('UserLeague', back_populates='user')
    favorites = relationship('Favorite', back_populates='user')


class Player(Base):
    __tablename__ = 'players'
    id = Column(Integer, primary_key=True, autoincrement=True)
    puuid = Column(String, unique=True)
    summoner_id = Column(String, unique=True)
    game_name = Column(String)
    game_name_lower = Column(String)
    tag_line = Column(String)
    delta_8h = Column(DECIMAL)
    delta_24h = Column(DECIMAL)
    delta_72h = Column(DECIMAL)
    delist_date = Column(Date)

    player_data = relationship('PlayerData', back_populates='player')
    portfolio_players = relationship('PortfolioPlayer', back_populates='player')
    portfolio_holds = relationship('PortfolioHold', back_populates='player')
    transactions = relationship('Transaction', back_populates='player')
    favorites = relationship('Favorite', back_populates='player')


class PlayerData(Base):
    __tablename__ = 'player_data'
    id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey('players.id'))
    date = Column(Date)
    league_points = Column(Integer)

    player = relationship('Player', back_populates='player_data')


class League(Base):
    __tablename__ = 'leagues'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    type = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    created_by = Column(Integer, ForeignKey('users.id'))

    user_leagues = relationship('UserLeague', back_populates='league')
    portfolios = relationship('Portfolio', back_populates='league')


class UserLeague(Base):
    __tablename__ = 'user_leagues'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    league_id = Column(Integer, ForeignKey('leagues.id'))

    user = relationship('User', back_populates='user_leagues')
    league = relationship('League', back_populates='user_leagues')


class Portfolio(Base):
    __tablename__ = 'portfolios'
    id = Column(Integer, primary_key=True, autoincrement=True)
    league_id = Column(Integer, ForeignKey('leagues.id'))
    current_value = Column(DECIMAL)

    league = relationship('League', back_populates='portfolios')
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
    hold_deadline = Column(Date)

    portfolio = relationship('Portfolio', back_populates='portfolio_holds')
    player = relationship('Player', back_populates='portfolio_holds')


class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String)
    player_id = Column(Integer, ForeignKey('players.id'))
    shares = Column(Integer)
    price = Column(DECIMAL)
    transaction_date = Column(Date)
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'))

    portfolio = relationship('Portfolio', back_populates='transactions')
    player = relationship('Player', back_populates='transactions')


class PortfolioHistory(Base):
    __tablename__ = 'portfolio_history'
    id = Column(Integer, primary_key=True, autoincrement=True)
    value = Column(DECIMAL)
    date = Column(DateTime)
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'))

    portfolio = relationship('Portfolio', back_populates='portfolio_history')


class Favorite(Base):
    __tablename__ = 'favorites'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    player_id = Column(Integer, ForeignKey('players.id'))

    user = relationship('User', back_populates='favorites')
    player = relationship('Player', back_populates='favorites')
