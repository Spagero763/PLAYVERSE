
'use client';

import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import AnimatedButton from '@/components/animated-button';
import { User, Users, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PlayModePage() {
  const router = useRouter();
  const params = useParams();
  const param = Array.isArray(params.game) ? params.game[0] : params.game;
  const gameName = (param || '').replace('-ai', '');

  return (
    <PageShell>
      <div className="relative flex flex-col items-center justify-center text-center animate-fade-in">
        <Button variant="ghost" size="icon" className="absolute left-0 top-0" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-4xl md:text-5xl font-headline font-bold capitalize">{gameName}</h1>
        <p className="mt-2 text-lg text-muted-foreground">How do you want to play?</p>
        <div className="mt-12 flex flex-col sm:flex-row gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link href={`/lobby?game=${gameName}`} passHref>
                <AnimatedButton>
                    <Users className="mr-2 h-5 w-5" />
                    Player vs Player
                </AnimatedButton>
            </Link>
            <Link href={`/games/${gameName}`} passHref>
                <AnimatedButton variant="secondary">
                    <User className="mr-2 h-5 w-5" />
                    Player vs AI
                </AnimatedButton>
            </Link>
        </div>
      </div>
    </PageShell>
  );
}
