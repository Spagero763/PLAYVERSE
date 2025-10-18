
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RotateCcw, Eye, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount } from 'wagmi';
import { updateUserProfile } from '@/lib/profile-manager';

const GRID_SIZE = 4;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const PUZZLE_IMAGES: ImagePlaceholder[] = [
    PlaceHolderImages.find(img => img.id === 'puzzle-jigsaw')!,
    PlaceHolderImages.find(img => img.id === 'puzzle-landscape')!,
].filter(Boolean);

type PuzzleType = 'image' | 'number';

const createSolvedBoard = () => {
  return Array.from({ length: TILE_COUNT }, (_, i) => i);
}

const isSolvable = (tiles: number[]) => {
  let inversions = 0;
  const emptyIndex = tiles.indexOf(TILE_COUNT - 1);
  const emptyRow = Math.floor(emptyIndex / GRID_SIZE);

  for (let i = 0; i < TILE_COUNT; i++) {
    for (let j = i + 1; j < TILE_COUNT; j++) {
      if (tiles[i] > tiles[j] && tiles[i] !== TILE_COUNT - 1 && tiles[j] !== TILE_COUNT - 1) {
        inversions++;
      }
    }
  }

  if (GRID_SIZE % 2 === 0) { // Even grid
    return (inversions + emptyRow) % 2 !== 0;
  }
  // Odd grid
  return inversions % 2 === 0;
};

const shuffleBoard = () => {
    let tiles: number[];
    do {
        tiles = createSolvedBoard()
            .map(tile => ({ tile, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ tile }) => tile);
    } while (!isSolvable(tiles));
    return tiles;
};


export const PuzzleGame = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [puzzleType, setPuzzleType] = useState<PuzzleType>('image');
  const [puzzleImage, setPuzzleImage] = useState<ImagePlaceholder>(PUZZLE_IMAGES[0]);
  const { isConnected } = useAccount();


  useEffect(() => {
    resetGame();
  }, [puzzleType, puzzleImage]);

  const emptyIndex = tiles.indexOf(TILE_COUNT - 1);
  
  const handleTileClick = (index: number) => {
    if (isWon || !tiles.length) return;

    const tileRow = Math.floor(index / GRID_SIZE);
    const tileCol = index % GRID_SIZE;
    
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const emptyCol = emptyIndex % GRID_SIZE;

    const isAdjacent = (Math.abs(tileRow - emptyRow) + Math.abs(tileCol - emptyCol)) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoves(m => m + 1);
    }
  };

  useEffect(() => {
    if (tiles.length === 0) return;
    const checkWin = () => {
      for (let i = 0; i < TILE_COUNT; i++) {
        if (tiles[i] !== i) return false;
      }
      return true;
    };
    if (checkWin()) {
      setIsWon(true);
      const xpEarned = Math.max(10, 200 - moves);
      updateUserProfile({ xp: xpEarned, win: true });
    }
  }, [tiles, isConnected, moves]);
  
  const resetGame = () => {
    setTiles(shuffleBoard());
    setMoves(0);
    setIsWon(false);
  }

  const changePuzzleType = (type: PuzzleType) => {
    setPuzzleType(type);
  }

  const handleImageChange = (imageId: string) => {
    const newImage = PUZZLE_IMAGES.find(img => img.id === imageId);
    if (newImage) {
        setPuzzleImage(newImage);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex justify-between items-center w-full max-w-sm md:max-w-md">
        <div className="text-xl font-headline text-accent h-8">
            {isWon ? `You won in ${moves} moves!` : `Moves: ${moves}`}
        </div>
        {puzzleType === 'image' && (
            <Button variant="outline" size="sm" onMouseDown={() => setShowPreview(true)} onMouseUp={() => setShowPreview(false)} onTouchStart={() => setShowPreview(true)} onTouchEnd={() => setShowPreview(false)}>
                <Eye className="mr-2 h-4 w-4"/>
                Preview
            </Button>
        )}
      </div>

       <div className="flex gap-2 mb-2">
            <Button onClick={() => changePuzzleType('image')} variant={puzzleType === 'image' ? 'default' : 'secondary'}>Image</Button>
            <Button onClick={() => changePuzzleType('number')} variant={puzzleType === 'number' ? 'default' : 'secondary'}>Numbers</Button>
       </div>

       {puzzleType === 'image' && (
            <div className="w-full max-w-sm md:max-w-md">
                <Select value={puzzleImage.id} onValueChange={handleImageChange}>
                    <SelectTrigger>
                        <ImageIcon className="mr-2" />
                        <SelectValue placeholder="Select an image" />
                    </SelectTrigger>
                    <SelectContent>
                        {PUZZLE_IMAGES.map(img => (
                            <SelectItem key={img.id} value={img.id}>
                                <div className="flex items-center gap-2">
                                    <Image src={img.imageUrl} alt={img.description} width={24} height={24} className="rounded-sm" />
                                    <span className='capitalize'>{img.imageHint}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
       )}

      <div
        className="grid p-1 rounded-lg bg-primary/10 shadow-lg relative mt-2"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          gap: '0.2rem',
          width: 'min(90vw, 400px)',
          height: 'min(90vw, 400px)',
        }}
      >
        {isWon && puzzleType === 'image' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 animate-fade-in rounded-lg">
             <Image src={puzzleImage.imageUrl} alt="Completed Puzzle" layout="fill" className="object-cover rounded-md" />
          </div>
        )}
        {showPreview && !isWon && puzzleType === 'image' && (
             <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 animate-fade-in p-4 rounded-lg">
                <Image src={puzzleImage.imageUrl} alt="Puzzle Preview" layout="fill" className="object-contain rounded-md" />
             </div>
        )}
        {tiles.map((tileValue, index) => {
          const isEmpty = tileValue === TILE_COUNT - 1;
          const correctRow = Math.floor(tileValue / GRID_SIZE);
          const correctCol = tileValue % GRID_SIZE;

          return (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              className={cn(
                'flex items-center justify-center rounded-sm text-2xl font-bold transition-all duration-300 ease-in-out select-none',
                isEmpty ? 'bg-transparent shadow-inner pointer-events-none' : 'cursor-pointer hover:scale-105 hover:z-10 shadow-md',
                puzzleType === 'image' ? 'bg-cover bg-no-repeat' : 'bg-secondary text-secondary-foreground'
              )}
              style={puzzleType === 'image' ? {
                backgroundImage: isEmpty ? 'none' : `url(${puzzleImage.imageUrl})`,
                backgroundSize: `${GRID_SIZE * 100}%`,
                backgroundPosition: `${correctCol * 100 / (GRID_SIZE - 1)}% ${correctRow * 100 / (GRID_SIZE - 1)}%`,
              } : {}}
            >
             {puzzleType === 'number' && !isEmpty && (tileValue + 1)}
            </div>
          );
        })}
      </div>
      {(isWon) && (
        <Button onClick={resetGame} variant="secondary" className="mt-4">
          <RotateCcw className="mr-2 h-4 w-4" />
          Play Again
        </Button>
      )}
    </div>
  );
};
