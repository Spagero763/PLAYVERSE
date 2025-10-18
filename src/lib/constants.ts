
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Game, LeaderboardEntry, UserProfile } from './types';

const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

// This list defines games that can be played in different modes
const baseGames: Omit<Game, 'type' | 'id' | 'url'>[] = [
    {
        name: 'Tic Tac Toe',
        image: findImage('tic-tac-toe')?.imageUrl || '',
        imageHint: findImage('tic-tac-toe')?.imageHint || '',
    },
    {
        name: 'Chess',
        image: findImage('chess')?.imageUrl || '',
        imageHint: findImage('chess')?.imageHint || '',
    },
    {
        name: 'Ping Pong',
        image: findImage('ping-pong')?.imageUrl || '',
        imageHint: findImage('ping-pong')?.imageHint || '',
    },
    {
        name: 'Puzzle',
        image: findImage('puzzle-jigsaw')?.imageUrl || '',
        imageHint: findImage('puzzle-jigsaw')?.imageHint || '',
    },
    {
        name: 'Memory Match',
        image: findImage('memory-match')?.imageUrl || '',
        imageHint: findImage('memory-match')?.imageHint || '',
    },
];

const getGameConfig = (name: string): Pick<Game, 'type' | 'id' | 'url'> => {
    const id = name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    const url = `/games/${id}`;

    switch (name) {
        case 'Ping Pong':
            return { type: 'AI', id, url };
        case 'Puzzle':
        case 'Memory Match':
            return { type: 'Single Player', id, url };
        default:
            return { type: 'Multiplayer', id, url };
    }
}

export const allGames: Game[] = baseGames.map(baseGame => {
    const config = getGameConfig(baseGame.name);
    return {
        ...baseGame,
        ...config,
    };
});

export const multiplayerGames: Game[] = allGames.filter(g => g.type === 'Multiplayer');
export const singlePlayerGames: Game[] = allGames.filter(g => g.type === 'Single Player' || g.type === 'AI');


export const leaderboardData: LeaderboardEntry[] = [];


export const defaultProfile: Omit<UserProfile, 'address'> = {
  name: 'Player',
  avatar: '',
  xp: 0,
  rank: 'Unranked',
  badges: [],
  gameplayData: {
    gamesPlayed: [],
    winLossRatio: '0%',
    averagePlaytime: '0 minutes',
    preferredGenres: [],
  },
  stats: [
    { month: 'May', gamesPlayed: 0, wins: 0 },
    { month: 'Jun', gamesPlayed: 0, wins: 0 },
    { month: 'Jul', gamesPlayed: 0, wins: 0 },
    { month: 'Aug', gamesPlayed: 0, wins: 0 },
    { month: 'Sep', gamesPlayed: 0, wins: 0 },
    { month: 'Oct', gamesPlayed: 0, wins: 0 },
  ],
};
