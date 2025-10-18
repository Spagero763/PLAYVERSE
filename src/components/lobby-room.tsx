'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Swords, Loader2, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from './ui/button';

export function LobbyRoom({ game }: { game: string }) {
  const router = useRouter();
  const [status, setStatus] = useState('matchmaking');
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (status === 'matchmaking') {
      const timer = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 500);

      const matchTimeout = setTimeout(() => {
        setStatus('found');
        setProgress(100);
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(matchTimeout);
      };
    }
  }, [status]);

  useEffect(() => {
    if (status === 'found') {
      const redirectTimeout = setTimeout(() => {
        router.push(`/games/${game}?mode=multiplayer`);
      }, 2000);
      return () => clearTimeout(redirectTimeout);
    }
  }, [status, game, router]);

  const PlayerCard = ({ name, avatar, isOpponent = false }: { name: string, avatar: string, isOpponent?: boolean }) => (
    <div className={`flex flex-col items-center gap-4 p-6 rounded-lg glass-card w-48 ${isOpponent && status !== 'found' ? 'opacity-50' : ''}`}>
      <Avatar className="h-20 w-20 border-4 border-primary">
        <AvatarImage src={avatar} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <h3 className="font-bold text-lg">{name}</h3>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 glass-card rounded-xl">
      <h2 className="text-3xl font-headline font-bold mb-2">Matchmaking for <span className="text-primary capitalize">{game}</span></h2>
      <p className="text-muted-foreground mb-8">Get ready for battle!</p>

      <div className="flex items-center justify-center gap-8 md:gap-16 mb-8">
        <PlayerCard name="You" avatar="https://picsum.photos/seed/you/100/100" />
        <Swords className="h-12 w-12 text-primary" />
        <PlayerCard name={status === 'found' ? 'Rival' : '...'} avatar={status === 'found' ? "https://picsum.photos/seed/rival/100/100" : ""} isOpponent />
      </div>

      <div className="w-full max-w-md">
        {status === 'matchmaking' && (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="font-semibold text-lg">Finding opponent...</p>
            </div>
            <Progress value={progress} className="w-full h-3" />
            <Button variant="destructive" className="mt-6" onClick={() => router.back()}>Cancel</Button>
          </>
        )}
        {status === 'found' && (
          <div className="flex flex-col items-center justify-center gap-2 text-accent">
            <CheckCircle className="h-10 w-10" />
            <p className="font-semibold text-xl">Opponent found! Starting game...</p>
          </div>
        )}
      </div>
    </div>
  );
}
