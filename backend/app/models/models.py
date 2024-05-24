from pydantic import BaseModel, SecretStr, Field
from typing import List, Optional, Dict
from datetime import datetime, timezone


class TokenData(BaseModel):
    username: Optional[str]


class BasePlayer(BaseModel):
    name: str
    tagLine: Optional[str] = None
    current_price: float


class Player(BasePlayer):
    purchase_price: float
    shares: int

    def total(self) -> float:
        return self.shares * self.current_price


class Holds(BaseModel):
    id: int
    gameName: str
    shares: int
    hold_deadline: datetime


class Portfolio(BaseModel):
    id: int
    players: Dict[str, Player] = {}
    holds: List[Holds] = []


class PortfolioHistory(BaseModel):
    id: int
    value: float
    date: datetime


class Transaction(BaseModel):
    id: int
    type: str  # 'buy' or 'sell'
    gameName: str
    shares: int
    price: float
    transaction_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TransactionRequest(BaseModel):
    shares: int


class FavoritesEntry(BaseModel):
    name: str
    current_price: float
    eight_hour_change: float = 0.0
    one_day_change: float = 0.0
    three_day_change: float = 0.0


class FavoritesResponse(BaseModel):
    favorites: List[FavoritesEntry]


class UserPublic(BaseModel):
    username: str
    transactions: List[Transaction] = []
    one_day_change: float = 0.0
    three_day_change: float = 0.0
    date_registered: datetime


class UserProfile(UserPublic):
    leagues: List['LeagueWithPortfolio'] = []
    favorites: List[FavoritesEntry] = []
    current_league_id: int


class UserSelf(UserProfile):
    password: Optional[SecretStr] = None


class ToggleFavoriteRequest(BaseModel):
    gameName: str  # Ensuring the request model matches the expected input
    tagLine: str


class LeaderboardEntry(BaseModel):
    gameName: str
    lp: float  # League points
    delta_8h: float  # Change in 8 hours
    delta_24h: float  # Change in 24 hours
    delta_72h: float  # Change in 72 hours
    rank: int


class PortfolioLeaderboardEntry(BaseModel):
    username: str
    value: float
    rank: int


class LeaderboardResponse(BaseModel):
    leaderboard_type: str  # LP, delta, portfolio
    entries: List[LeaderboardEntry]


class PortfolioLeaderboardResponse(BaseModel):
    leaderboard_type: str
    entries: List[PortfolioLeaderboardEntry]


class TopLeaderboardEntry(BaseModel):
    name: str
    value: float


class TopLeaderboard(BaseModel):
    price: TopLeaderboardEntry
    delta_8h: TopLeaderboardEntry
    delta_24h: TopLeaderboardEntry
    delta_72h: TopLeaderboardEntry
    portfolio_value: TopLeaderboardEntry


class SessionData(BaseModel):
    username: str


class UsernameChangeRequest(BaseModel):
    newUsername: str


class PasswordUpdateModel(BaseModel):
    oldPassword: str
    newPassword: str


class League(BaseModel):
    id: int
    name: str
    type: str
    start_date: datetime
    end_date: datetime
    created_by: Optional[int] = None  # Nullable field


class UserLeague(BaseModel):
    user_id: int
    league_id: int
    portfolio_id: int
    balance: float = 100_000.0
    rank: Optional[int] = None


class LeagueWithPortfolio(BaseModel):
    league: League
    portfolio: Portfolio
    portfolio_history: List[PortfolioHistory]
    one_day_change: Optional[float] = None
    three_day_change: Optional[float] = None


class UserWithLeagues(BaseModel):
    user: UserProfile
    leagues: List[LeagueWithPortfolio]
