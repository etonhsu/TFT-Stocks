const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Standard leaderboard entry
export interface LeaderboardEntry {
  gameName: string;
  tagLine: string;
  lp: number;
  delta_8h: number;
  delta_24h: number;
  delta_72h: number;
  rank: number;
}

// Portfolio leaderboard entry
export interface PortfolioLeaderboardEntry {
  username: string;
  value: number;
  rank: number;
}

// Generic response interface
interface LeaderboardResponse {
  entries: Array<LeaderboardEntry | PortfolioLeaderboardEntry>;
  totalEntries: number;
}

// Function to fetch leaderboard data
export async function fetchLeaderboardData(leadType: string, page: number = 0, limit: number = 100): Promise<LeaderboardResponse> {
  const url: string = `${backendUrl}/leaderboard/${leadType}?limit=${limit}&page=${page}`;
  try {
    const response: Response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (leadType === 'portfolio') {
      // Assuming the API returns items in the format expected for portfolio entries
      return {
        entries: data.entries.map((entry: PortfolioLeaderboardEntry) => ({
          username: entry.username,
          value: entry.value,
          rank: entry.rank
        })),
        totalEntries: data.totalEntries
      } as LeaderboardResponse;
    } else {
      // Transform the data for standard leaderboard entries
      return {
        entries: data.entries.map((entry: LeaderboardEntry) => ({
          gameName: entry.gameName,
          tagLine: entry.tagLine,
          lp: entry.lp,
          delta_8h: entry.delta_8h,
          delta_24h: entry.delta_24h,
          delta_72h: entry.delta_72h,
          rank: entry.rank
        })),
        totalEntries: data.totalEntries
      } as LeaderboardResponse;
    }
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error);
    throw error;
  }
}
