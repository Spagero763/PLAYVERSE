
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { updateUserProfile } from '@/lib/profile-manager';
import { useAccount } from 'wagmi';

type Player = 'X' | 'O';
type Squares = Array<Player | null>;

const Square = ({ value, onSquareClick, isWinner }: { value: Player | null, onSquareClick: () => void, isWinner: boolean }) => {
  return (
    <button 
      className={cn(
        "flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-lg border-2 border-primary/50 text-5xl font-bold transition-colors duration-300",
        "hover:bg-primary/10",
        value === 'X' ? "text-accent" : "text-primary",
        isWinner ? "bg-primary/30 animate-pulse" : "bg-secondary/50"
      )}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
};

const Board = ({ xIsNext, squares, onPlay, winnerInfo, gameMode }: { xIsNext: boolean, squares: Squares, onPlay: (squares: Squares) => void, winnerInfo: { winner: Player | 'Draw' | null, line: number[] | null }, gameMode: string | null }) => {
  const handleClick = (i: number) => {
    if (winnerInfo.winner || squares[i]) {
      return;
    }
    if (gameMode === 'multiplayer' || xIsNext) {
        const nextSquares = squares.slice();
        nextSquares[i] = xIsNext ? 'X' : 'O';
        onPlay(nextSquares);
    }
  };

  let status;
  if (winnerInfo.winner && winnerInfo.winner !== 'Draw') {
    if(gameMode === 'multiplayer') {
      status = `Winner: Player ${winnerInfo.winner}`;
    } else {
      status = winnerInfo.winner === 'X' ? 'You win!' : 'AI wins!';
    }
  } else if (winnerInfo.winner === 'Draw') {
    status = 'Draw';
  } else {
     if(gameMode === 'multiplayer') {
        status = `Next player: Player ${xIsNext ? 'X' : 'O'}`;
     } else {
        status = `Next player: ${xIsNext ? 'You (X)' : 'AI (O)'}`;
     }
  }

  const renderSquare = (i: number) => {
    const isWinnerSquare = winnerInfo.line?.includes(i) ?? false;
    return <Square value={squares[i]} onSquareClick={() => handleClick(i)} isWinner={isWinnerSquare} />;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-headline text-accent h-8">{status}</div>
      <div className="grid grid-cols-3 gap-2 p-4 rounded-lg glass-card">
        {Array(9).fill(null).map((_, i) => (
            <div key={i}>
                {renderSquare(i)}
            </div>
        ))}
      </div>
    </div>
  );
};

export const TicTacToeGame = ({ difficulty, setDifficulty, gameMode }: { difficulty: 'easy' | 'medium' | 'hard' | null, setDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | null) => void, gameMode: string | null }) => {
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const { isConnected } = useAccount();
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];
  
    const winnerInfo = calculateWinner(currentSquares);

    useEffect(() => {
        if (winnerInfo.winner) {
            const isPlayerWin = winnerInfo.winner === 'X';
            const isAiWin = winnerInfo.winner === 'O';
            if (isPlayerWin || isAiWin) { // A game has concluded
              updateUserProfile({ xp: isPlayerWin ? 100 : 0, win: isPlayerWin });
            }
        }
    }, [winnerInfo.winner]);

    function handlePlay(nextSquares: Squares) {
      const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
    }

    useEffect(() => {
      if (gameMode !== 'multiplayer' && !xIsNext && !winnerInfo.winner && difficulty) {
        const handler = setTimeout(() => {
          const aiMove = getAIMove(currentSquares, difficulty);
          if (aiMove !== -1) {
            const nextSquares = currentSquares.slice();
            nextSquares[aiMove] = 'O';
            handlePlay(nextSquares);
          }
        }, 500);
  
        return () => clearTimeout(handler);
      }
    }, [currentMove, difficulty, xIsNext, currentSquares, winnerInfo.winner, gameMode, handlePlay]);

    function resetGame() {
      setHistory([Array(9).fill(null)]);
      setCurrentMove(0);
      if (setDifficulty) {
        setDifficulty(null);
      }
    }

    return (
      <div className="flex flex-col items-center justify-center gap-8">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} winnerInfo={winnerInfo} gameMode={gameMode} />
        {(winnerInfo.winner) && (
            <Button onClick={resetGame} variant="secondary">
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
            </Button>
        )}
      </div>
    );
}

function calculateWinner(squares: Squares): { winner: 'X' | 'O' | 'Draw' | null, line: number[] | null } {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  if (squares.every(Boolean)) {
    return { winner: 'Draw', line: null };
  }
  return { winner: null, line: null };
}

function getAIMove(squares: Squares, difficulty: 'easy' | 'medium' | 'hard'): number {
  const emptyIndices = squares.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];

  if (difficulty === 'hard') {
    const move = minimax(squares, 'O');
    return move.index ?? -1;
  }

  if (difficulty === 'medium') {
    for (const index of emptyIndices) {
      const tempSquares = squares.slice();
      tempSquares[index] = 'O';
      if (calculateWinner(tempSquares).winner === 'O') return index;
    }
    for (const index of emptyIndices) {
      const tempSquares = squares.slice();
      tempSquares[index] = 'X';
      if (calculateWinner(tempSquares).winner === 'X') return index;
    }
    if (squares[4] === null) return 4;
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

function minimax(newBoard: Squares, player: 'X' | 'O'): { score: number, index?: number } {
  const availSpots = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];

  const winnerInfo = calculateWinner(newBoard);
  if (winnerInfo.winner === 'X') return { score: -10 };
  if (winnerInfo.winner === 'O') return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves: { score: number, index: number }[] = [];
  for (let i = 0; i < availSpots.length; i++) {
    const move: { score: number, index: number } = { score: 0, index: availSpots[i] };
    newBoard[availSpots[i]] = player;

    if (player === 'O') {
      const result = minimax(newBoard, 'X');
      move.score = result.score;
    } else {
      const result = minimax(newBoard, 'O');
      move.score = result.score;
    }

    newBoard[availSpots[i]] = null;
    moves.push(move);
  }

  let bestMove = -1;
  let bestScore = player === 'O' ? -Infinity : Infinity;

  for (let i = 0; i < moves.length; i++) {
    if (player === 'O') {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    } else {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}
