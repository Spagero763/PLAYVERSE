
'use client';

import { useState, useEffect } from 'react';
import StakeModal from '@/components/stake-modal';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TicTacToeGame } from '@/components/games/tic-tac-toe';
import { ChessGame } from '@/components/games/chess-game';
import { PingPongGame } from '@/components/games/ping-pong-game';
import { MemoryMatchGame } from '@/components/games/memory-match-game';
import { PuzzleGame } from '@/components/games/puzzle-game';
import { Gamepad2, ArrowLeft, HardHat, ToyBrick, Bot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AnimatedButton from '@/components/animated-button';

const AiGames = ['tic-tac-toe', 'chess', 'ping-pong'];

const GameContent = ({ game, mode }: { game: string, mode: string | null }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [stakeOpen, setStakeOpen] = useState(false);
  const [stakeDone, setStakeDone] = useState(false);

  const needsDifficulty = AiGames.includes(game.toLowerCase()) && mode !== 'multiplayer';

  // Helper to create a bytes32-ish id for game instance
  const generateGameId = () => {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return '0x' + Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    // if user selects hard mode, open the stake modal
    if (difficulty === 'hard' && !stakeDone) {
      setStakeOpen(true);
    }
  }, [difficulty, stakeDone]);

  if (needsDifficulty && !difficulty) {
    return (
      <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-headline text-accent">Select Difficulty</h2>
          <div className="flex flex-col gap-4 w-full">
              <AnimatedButton variant="secondary" onClick={() => setDifficulty('easy')}>
                  <ToyBrick className="mr-2 h-5 w-5" />
                  Easy
              </AnimatedButton>
              <AnimatedButton variant="secondary" onClick={() => setDifficulty('medium')}>
                  <Bot className="mr-2 h-5 w-5" />
                  Medium
              </AnimatedButton>
              <AnimatedButton variant="secondary" onClick={() => setDifficulty('hard')}>
                  <HardHat className="mr-2 h-5 w-5" />
                  Hard
              </AnimatedButton>
          </div>
      </div>
    );
  }

  const normalizedGame = game.toLowerCase();

  // If hard mode selected, require a stake before rendering the game
  if (difficulty === 'hard' && !stakeDone) {
    const gid = generateGameId();
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg">Hard mode requires a small stake before starting.</p>
        <AnimatedButton variant="secondary" onClick={() => setStakeOpen(true)}>
          <HardHat className="mr-2 h-5 w-5" />
          Stake & Play
        </AnimatedButton>
        <StakeModal open={stakeOpen} onOpenChange={setStakeOpen} gameId={gid} onSuccess={() => setStakeDone(true)} />
      </div>
    );
  }

  if (normalizedGame === 'tic-tac-toe') {
    return <TicTacToeGame difficulty={difficulty} setDifficulty={setDifficulty} gameMode={mode} />;
  }
  if (normalizedGame === 'chess') {
    return <ChessGame difficulty={difficulty!} setDifficulty={setDifficulty} />;
  }
  if (normalizedGame === 'ping-pong') {
    return <PingPongGame difficulty={difficulty!} setDifficulty={setDifficulty} />;
  }
  if (normalizedGame === 'memory-match') {
    return <MemoryMatchGame />;
  }
  if (normalizedGame === 'puzzle') {
    return <PuzzleGame />;
  }

  return <p className="text-muted-foreground text-2xl">{`Game logic for ${game} would be rendered here.`}</p>;
}


export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawGameParam = Array.isArray(params.game) ? params.game[0] : params.game;
  const game = rawGameParam ?? '';
  const mode = searchParams.get('mode');
  const hero = PlaceHolderImages.find((p) => p.id === game || p.id === game.replace(/-/g, ''));
  const isAiPlay = AiGames.includes(game.toLowerCase()) && mode !== 'multiplayer';

  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="relative w-full flex justify-center items-center">
            <Button variant="ghost" size="icon" className="absolute left-0" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Go back</span>
            </Button>
            <h1 className="text-4xl md:text-5xl font-headline font-bold capitalize">{(game || 'unknown').replace(/-/g,' ')}</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">The battle is about to begin. Good luck!</p>
        {!isAiPlay && hero?.imageUrl && (
          <div className="relative mt-6 w-full max-w-3xl h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/20">
            <Image
              src={hero.imageUrl}
              alt={hero.description}
              data-ai-hint={hero.imageHint}
              fill
              className="object-cover scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/50 via-transparent to-background/20" />
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <Card className="w-full max-w-md lg:max-w-2xl glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Gamepad2 className="text-primary" />
              Game Arena
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-2 sm:p-6">
            <GameContent game={game} mode={mode} />
          </CardContent>
        </Card>
      </div>
      {null}
    </PageShell>
  );
}
