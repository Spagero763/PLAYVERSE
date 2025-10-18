
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RotateCcw, Gamepad2, Diamond, Heart, Club, Spade, Star, Sun, Moon, Cloud } from 'lucide-react';

const ICONS = [
  { icon: Diamond, name: 'Diamond' },
  { icon: Heart, name: 'Heart' },
  { icon: Club, name: 'Club' },
  { icon: Spade, name: 'Spade' },
  { icon: Star, name: 'Star' },
  { icon: Sun, name: 'Sun' },
  { icon: Moon, name: 'Moon' },
  { icon: Cloud, name: 'Cloud' },
];

type CardType = {
  id: number;
  icon: React.ElementType;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const generateCards = (): CardType[] => {
  const duplicatedIcons = [...ICONS, ...ICONS];
  return duplicatedIcons
    .map((icon, index) => ({
      id: index,
      icon: icon.icon,
      name: icon.name,
      isFlipped: false,
      isMatched: false,
    }))
    .sort(() => Math.random() - 0.5);
};

export const MemoryMatchGame = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setCards(generateCards());
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCardIndex, secondCardIndex] = flippedCards;
      const firstCard = cards[firstCardIndex];
      const secondCard = cards[secondCardIndex];

      if (firstCard.name === secondCard.name) {
        // Match
        setCards(prevCards =>
          prevCards.map(card =>
            card.name === firstCard.name ? { ...card, isMatched: true } : card
          )
        );
        setFlippedCards([]);
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map((card, index) =>
              index === firstCardIndex || index === secondCardIndex
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setGameOver(true);
    }
  }, [cards]);


  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    setCards(prevCards =>
      prevCards.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedCards(prev => [...prev, index]);
  };

  const resetGame = () => {
    setCards(generateCards());
    setFlippedCards([]);
    setMoves(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-2xl font-headline text-accent">
        {gameOver ? `Completed in ${moves} moves!` : `Moves: ${moves}`}
      </div>
      <div className="grid grid-cols-4 gap-4 p-4 rounded-lg glass-card">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="h-20 w-20 md:h-24 md:w-24 rounded-lg perspective cursor-pointer"
            onClick={() => handleCardClick(index)}
          >
            <div className={cn(
                "relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500",
                (card.isFlipped || card.isMatched) ? '[transform:rotateY(180deg)]' : ''
            )}>
              {/* Front of card */}
              <div className="absolute w-full h-full flex items-center justify-center bg-primary/20 rounded-lg [backface-visibility:hidden]">
                 <Gamepad2 className="h-10 w-10 text-primary" />
              </div>
              {/* Back of card */}
              <div className="absolute w-full h-full flex items-center justify-center bg-secondary rounded-lg [transform:rotateY(180deg)] [backface-visibility:hidden]">
                 <card.icon className="h-10 w-10 text-accent" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {gameOver && (
        <Button onClick={resetGame} variant="secondary" className="mt-4">
          <RotateCcw className="mr-2 h-4 w-4" />
          Play Again
        </Button>
      )}
      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};
