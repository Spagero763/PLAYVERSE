
'use client';

import { useState } from 'react';
import GameCard from '@/components/game-card';
import { PageShell } from '@/components/page-shell';
import { allGames } from '@/lib/constants';
import { Game } from '@/lib/types';
import GameModeSelection from '@/components/game-mode-selection';

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
  };

  return (
    <PageShell>
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Choose a Game to Play</h1>
        <p className="mt-2 text-lg text-muted-foreground">Challenge other players or our advanced AI.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {allGames.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} onPlayClick={() => handleGameSelect(game)} />
        ))}
      </div>
       {selectedGame && (
        <GameModeSelection
          game={selectedGame}
          isOpen={!!selectedGame}
          onClose={handleCloseModal}
        />
      )}
    </PageShell>
  );
}
