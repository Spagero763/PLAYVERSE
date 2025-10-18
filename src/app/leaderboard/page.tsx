
'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/page-shell';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Crown, Shield, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LeaderboardEntry, UserProfile } from '@/lib/types';
import { getAllUserProfiles } from '@/lib/profile-manager';

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
  if (rank === 2) return <Crown className="h-6 w-6 text-gray-400" />;
  if (rank === 3) return <Crown className="h-6 w-6 text-yellow-600" />;
  return <Shield className="h-5 w-5 text-muted-foreground" />;
};

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const profiles: UserProfile[] = getAllUserProfiles();
    
    const sortedProfiles = profiles.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    
    const data: LeaderboardEntry[] = sortedProfiles.map((profile, index) => ({
      rank: index + 1,
      player: profile.name,
      wins: (profile.stats || []).reduce((acc, stat) => acc + stat.wins, 0),
      avatar: profile.avatar,
    }));

    setLeaderboardData(data);
  }, []);

  return (
    <PageShell>
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Top Players</h1>
        <p className="mt-2 text-lg text-muted-foreground">See who reigns supreme in the PlayVerse.</p>
      </div>
      <div className="mt-12 glass-card p-0 animate-slide-up">
        {leaderboardData && leaderboardData.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow className="border-b-primary/20">
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Wins</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leaderboardData.map((entry, index) => (
                <TableRow
                    key={entry.rank}
                    className={cn('border-b-primary/10', {
                    'bg-primary/20': index < 3,
                    })}
                >
                    <TableCell className="text-center font-medium">
                    <div className="flex items-center justify-center gap-2">
                        {getRankIcon(entry.rank)}
                        <span className="text-lg">{entry.rank}</span>
                    </div>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-4">
                        <Avatar className='h-10 w-10'>
                        <AvatarImage src={entry.avatar} alt={entry.player} />
                        <AvatarFallback>{entry.player.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-lg">{entry.player}</span>
                    </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary text-lg">{entry.wins}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                <Trophy className="h-16 w-16 text-primary" />
                <h2 className="text-2xl font-headline font-bold">The Leaderboard is Empty</h2>
                <p className="text-muted-foreground">
                    Be the first to win a game and claim the top spot!
                </p>
            </div>
        )}
      </div>
    </PageShell>
  );
}
