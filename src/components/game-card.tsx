
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Game } from '@/lib/types';
import { Play } from 'lucide-react';

interface GameCardProps {
  game: Game;
  index: number;
  onPlayClick: () => void;
}

const GameCard = ({ game, index, onPlayClick }: GameCardProps) => {
  return (
    <div
      className="glass-card-strong group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-48 w-full">
        <Image
          src={game.image}
          alt={game.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          data-ai-hint={game.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold font-headline">{game.name}</h3>
        
        <Button
          onClick={onPlayClick}
          variant="ghost"
          className="mt-4 w-full justify-center bg-primary/20 text-primary-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/50"
        >
          <Play className="mr-2 h-4 w-4" />
          Play Now
        </Button>
      </div>
    </div>
  );
};

export default GameCard;
