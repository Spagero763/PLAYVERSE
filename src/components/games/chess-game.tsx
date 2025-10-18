
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { updateUserProfile } from '@/lib/profile-manager';
import { useAccount } from 'wagmi';

export const ChessGame = ({ difficulty, setDifficulty }: { difficulty: 'easy' | 'medium' | 'hard', setDifficulty: (difficulty: null) => void }) => {
  const game = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(game.fen());
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveOptions, setMoveOptions] = useState<Record<string, any>>({});
  const { isConnected } = useAccount();

  function getMoveOptions(square: Square) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      return;
    }

    const options: Record<string, any> = {};
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      options[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to)!.color !== game.get(square)!.color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    }
    setMoveOptions(options);
  }

  function makeBestMove() {
    const possibleMoves = game.moves();
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) return;

    let bestMove;

    if (difficulty === 'easy') {
      bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else if (difficulty === 'medium') {
      const captureMoves = possibleMoves.filter(move => move.includes('x'));
      if (captureMoves.length > 0) {
        bestMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      } else {
        bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      }
    } else { // Hard
      let bestValue = -Infinity;
      bestMove = null;

      possibleMoves.forEach(move => {
          game.move(move);
          const boardValue = -evaluateBoard(game);
          game.undo();
          if (boardValue > bestValue) {
              bestValue = boardValue;
              bestMove = move;
          }
      });
    }

    if (bestMove) {
        game.move(bestMove);
        setFen(game.fen());
        checkGameState();
    }
  }

  function evaluateBoard(game: any) {
    let totalEvaluation = 0;
    game.board().forEach((row: any) => {
        row.forEach((piece: any) => {
            if (piece) {
                totalEvaluation += getPieceValue(piece.type, piece.color);
            }
        });
    });
    return totalEvaluation;
  }

  function getPieceValue(piece: string, color: 'w' | 'b') {
    const absoluteValue: {[key: string]: number} = {
        'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900
    };
    const value = absoluteValue[piece];
    return color === 'w' ? value : -value;
  }

  useEffect(() => {
    if (game.turn() === 'b' && !gameOverMessage) {
        const timeout = setTimeout(() => {
            makeBestMove();
        }, 500);
        return () => clearTimeout(timeout);
    }
  }, [fen, game, gameOverMessage, difficulty]);


  function onSquareClick(square: Square) {
    if (gameOverMessage || game.turn() !== 'w') return;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        getMoveOptions(square);
      }
      return;
    }

    if (square === selectedSquare) {
      setSelectedSquare(null);
      setMoveOptions({});
      return;
    }
    
    let move = null;
    try {
        move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q', // always promote to a queen for simplicity
        });
    } catch (e) {
        setSelectedSquare(null);
        setMoveOptions({});
        return;
    }

    if (move === null) {
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
            setSelectedSquare(square);
            getMoveOptions(square);
        } else {
            setSelectedSquare(null);
            setMoveOptions({});
        }
        return;
    }
    
    setFen(game.fen());
    checkGameState();
    setSelectedSquare(null);
    setMoveOptions({});
  }

  function checkGameState() {
    let message = '';
    let playerWon = false;
    let isFinished = true;
    if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        message = `Checkmate! ${winner} wins.`;
        playerWon = winner === 'White';
    } else if (game.isDraw()) {
        message = 'Draw!';
    } else if (game.isStalemate()) {
        message = 'Stalemate!';
    } else if (game.isThreefoldRepetition()) {
        message = 'Draw by threefold repetition!';
    } else if (game.isInsufficientMaterial()) {
        message = 'Draw by insufficient material!';
    } else {
        isFinished = false;
    }

    if(isFinished) {
        setGameOverMessage(message);
        updateUserProfile({ xp: playerWon ? 100 : 0, win: playerWon });
    }
  }

  function resetGame() {
    game.reset();
    setFen(game.fen());
    setGameOverMessage('');
    setSelectedSquare(null);
    setMoveOptions({});
    setDifficulty(null);
  }

  const customSquareStyles: Record<string, any> = { ...moveOptions };

  if (selectedSquare) {
    customSquareStyles[selectedSquare] = { backgroundColor: 'rgba(190, 82, 242, 0.5)' };
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-2xl font-headline text-accent h-8">
        {gameOverMessage ? gameOverMessage : `Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`}
      </div>
      <div className="w-full max-w-[400px] sm:max-w-sm md:max-w-md">
        <Chessboard 
            position={fen} 
            onSquareClick={onSquareClick}
            customSquareStyles={customSquareStyles}
            arePiecesDraggable={false}
        />
      </div>
      {(gameOverMessage) && (
          <Button onClick={resetGame} variant="secondary">
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
          </Button>
      )}
    </div>
  );
};
