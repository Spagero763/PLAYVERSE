export type Game = {
  id: string;
  name: string;
  type: 'Multiplayer' | 'Single Player' | 'AI';
  image: string;
  imageHint: string;
  url: string;
};

export type LeaderboardEntry = {
  rank: number;
  player: string;
  wins: number;
  avatar: string;
};

export type UserProfile = {
  address: string;
  name: string;
  avatar: string;
  xp: number;
  rank: string;
  badges: string[];
  gameplayData: {
    gamesPlayed: string[];
    winLossRatio: string;
    averagePlaytime: string;
    preferredGenres: string[];
  };
  stats: { month: string; gamesPlayed: number; wins: number }[];
};
