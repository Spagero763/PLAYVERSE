
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Game } from '@/lib/types';
import { User, Users, X } from 'lucide-react';
import { Button } from './ui/button';
import AnimatedButton from './animated-button';

interface GameModeSelectionProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GameModeSelection({ game, isOpen, onClose }: GameModeSelectionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(isOpen);
  }, [isOpen]);

  if (!game) return null;

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsMounted(false);
    }
  };

  const gameName = game.id.toLowerCase();
  const supportsAI = ['tic-tac-toe', 'chess', 'ping-pong'].includes(gameName);
  const isAiOnly = game.type === 'AI';
  const isSinglePlayerOnly = game.type === 'Single Player';

  const renderContent = () => {
    if (isAiOnly || isSinglePlayerOnly) {
       return (
        <Link href={`/games/${game.id.toLowerCase()}`} passHref>
          <AnimatedButton variant="secondary" onClick={onClose}>
            <User className="mr-2 h-5 w-5" />
            {isAiOnly ? 'Play vs AI' : 'Play Game'}
          </AnimatedButton>
        </Link>
       )
    }

    return (
      <>
        <Link href={`/games/${gameName}?mode=multiplayer`} passHref>
          <AnimatedButton onClick={onClose}>
            <Users className="mr-2 h-5 w-5" />
            Play with Friend
          </AnimatedButton>
        </Link>

        {supportsAI ? (
          <Link href={`/games/${gameName}`} passHref>
            <AnimatedButton variant="secondary" onClick={onClose}>
              <User className="mr-2 h-5 w-5" />
              Play vs AI
            </AnimatedButton>
          </Link>
        ) : (
            <div className='relative'>
                <AnimatedButton variant="secondary" disabled>
                    <User className="mr-2 h-5 w-5" />
                    Play vs AI
                </AnimatedButton>
                <div className="absolute -bottom-6 right-0 text-xs text-muted-foreground"> (Coming Soon)</div>
            </div>
        )}
      </>
    )
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backdropFilter: isOpen ? 'blur(10px)' : 'blur(0px)' }}
      onAnimationEnd={handleAnimationEnd}
    >
      {isMounted && (
        <div
          className={`relative w-full max-w-md rounded-xl border-2 bg-background/80 p-8 transition-all duration-300
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          style={{
            borderImage: 'linear-gradient(to right, #BE52F2, #52BFF2) 1',
            boxShadow: '0 0 40px 5px hsl(var(--primary) / 0.2), 0 0 10px 1px hsl(var(--accent) / 0.2)',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-headline font-bold capitalize">{game.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">How do you want to play?</p>
          </div>

          <div className="mt-12 flex flex-col gap-6">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
}
