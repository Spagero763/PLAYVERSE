
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { updateUserProfile } from '@/lib/profile-manager';

const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 15;

export function PingPongGame({ difficulty, setDifficulty }: { difficulty: 'easy' | 'medium' | 'hard', setDifficulty: (difficulty: null) => void }) {
  const [paddleX, setPaddleX] = useState((BOARD_WIDTH - PADDLE_WIDTH) / 2);
  const paddleXRef = useRef(paddleX);
  const { isConnected } = useAccount();

  const [aiPaddleX, setAiPaddleX] = useState((BOARD_WIDTH - PADDLE_WIDTH) / 2);
  const [ball, setBall] = useState({
    x: BOARD_WIDTH / 2,
    y: BOARD_HEIGHT / 2,
    dx: 3,
    dy: 3,
  });
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameOver, setGameOver] = useState<string | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [gameEnded, setGameEnded] = useState(false);

  const resetBall = useCallback((winner: 'player' | 'ai') => {
    setBall({
      x: BOARD_WIDTH / 2,
      y: BOARD_HEIGHT / 2,
      dx: Math.random() > 0.5 ? 4 : -4,
      dy: winner === 'player' ? 4 : -4,
    });
  }, []);

  const resetGame = () => {
    setScore({ player: 0, ai: 0 });
    setGameOver(null);
    setGameEnded(false);
    const initialPaddleX = (BOARD_WIDTH - PADDLE_WIDTH) / 2;
    setPaddleX(initialPaddleX);
    paddleXRef.current = initialPaddleX;
    resetBall('ai');
    setDifficulty(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameAreaRef.current && !gameOver) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        let newPaddleX = e.clientX - rect.left - PADDLE_WIDTH / 2;
        newPaddleX = Math.max(0, newPaddleX);
        newPaddleX = Math.min(newPaddleX, BOARD_WIDTH - PADDLE_WIDTH);
        
        if (newPaddleX !== paddleXRef.current) {
            paddleXRef.current = newPaddleX;
            setPaddleX(newPaddleX);
        }
      }
    };

    const gameDiv = gameAreaRef.current;
    gameDiv?.addEventListener('mousemove', handleMouseMove);
    return () => gameDiv?.removeEventListener('mousemove', handleMouseMove);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setBall(prevBall => {
        let { x, y, dx, dy } = { ...prevBall };

        x += dx;
        y += dy;

        if (x <= 0 || x >= BOARD_WIDTH - BALL_SIZE) {
          dx = -dx;
        }

        if (y <= PADDLE_HEIGHT && y > 0 && x + BALL_SIZE >= aiPaddleX && x <= aiPaddleX + PADDLE_WIDTH) {
          dy = -dy;
          dy *= 1.05;
          dx *= 1.05;
        }
        if (y >= BOARD_HEIGHT - PADDLE_HEIGHT * 2 && y < BOARD_HEIGHT - PADDLE_HEIGHT && x + BALL_SIZE >= paddleXRef.current && x <= paddleXRef.current + PADDLE_WIDTH) {
          dy = -dy;
           dy *= 1.05;
           dx *= 1.05;
        }

        if (y >= BOARD_HEIGHT) {
          setScore(s => ({ ...s, ai: s.ai + 1 }));
          resetBall('ai');
        } else if (y <= 0) {
          setScore(s => ({ ...s, player: s.player + 1 }));
          resetBall('player');
        }

        setAiPaddleX(prevAiX => {
            const ballCenter = x + BALL_SIZE / 2;
            let aiSpeed = 0.05; // easy
            if (difficulty === 'medium') aiSpeed = 0.1;
            if (difficulty === 'hard') aiSpeed = 0.2;

            if (dy < 0) { // Only move if ball is coming towards AI
                const target = ballCenter - PADDLE_WIDTH/2;
                const newAiX = prevAiX + (target - prevAiX) * aiSpeed;
                return Math.max(0, Math.min(newAiX, BOARD_WIDTH - PADDLE_WIDTH));
            }
            return prevAiX;
        });

        return { x, y, dx, dy };
      });

    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameOver, resetBall, aiPaddleX, difficulty]);

  useEffect(() => {
    if (gameEnded) return;

    let playerWon = false;
    let message = '';
    
    if (score.player >= 10) {
      message = 'You Win!';
      playerWon = true;
    }
    if (score.ai >= 10) {
      message = 'AI Wins!';
      playerWon = false;
    }

    if (message) {
      setGameOver(message);
      setGameEnded(true);
      updateUserProfile({ xp: playerWon ? 100 : 0, win: playerWon });
    }
  }, [score, isConnected, gameEnded]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex justify-between w-full text-2xl font-headline">
        <span className='text-accent'>Player: {score.player}</span>
        <span className='text-primary'>AI: {score.ai}</span>
      </div>
      <div
        ref={gameAreaRef}
        className="relative bg-primary/10 border-4 border-primary/50 rounded-lg overflow-hidden"
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
      >
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10 animate-fade-in">
            <h2 className="text-4xl font-bold font-headline text-white">{gameOver}</h2>
            <Button onClick={resetGame} variant="secondary" className="mt-4">
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
          </div>
        )}
        <div
          className="absolute bg-primary rounded-md"
          style={{
            left: aiPaddleX,
            top: PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
          }}
        />
        <div
          className="absolute bg-accent rounded-md"
          style={{
            left: paddleX,
            bottom: PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
          }}
        />
        <div
          className="absolute bg-foreground rounded-full"
          style={{
            left: ball.x,
            top: ball.y,
            width: BALL_SIZE,
            height: BALL_SIZE,
          }}
        />
        <div className="absolute top-1/2 left-0 w-full h-1 border-t-2 border-dashed border-primary/30 -translate-y-1/2" />
      </div>
    </div>
  );
}
