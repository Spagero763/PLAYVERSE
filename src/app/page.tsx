'use client';

import Image from 'next/image';
import { Users, Bot, BarChart, UserPlus, Wallet } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import AnimatedButton from '@/components/animated-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

const features = [
  {
    icon: Users,
    title: 'Multiplayer Battles',
    description: 'Challenge friends or match with players worldwide in real-time.',
  },
  {
    icon: Bot,
    title: 'AI Challenges',
    description: 'Hone your skills against our advanced AI with multiple difficulty levels.',
  },
  {
    icon: BarChart,
    title: 'Track Your Progress',
    description: 'Climb the leaderboards, earn badges, and watch your stats grow.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'game-controller-hero');

  return (
    <PageShell>
      <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-12rem)]">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-6xl md:text-8xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-fade-in-slow">
            PlayVerse
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Your ultimate destination for competitive multiplayer and challenging AI-powered games. Jump in and start your legacy.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link href="/signup" passHref>
              <AnimatedButton>
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
              </AnimatedButton>
            </Link>
             <Link href="/login" passHref>
              <AnimatedButton variant='secondary'>
                <Wallet className="mr-2 h-5 w-5" />
                Login with Wallet
              </AnimatedButton>
            </Link>
          </div>
        </div>
         <div className="hidden lg:flex justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {heroImage && (
                <div className="relative w-full max-w-lg aspect-square rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl shadow-primary/30">
                    <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                    />
                     <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-transparent to-background" />
                </div>
            )}
        </div>
      </div>
      <div className="py-24">
        <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-headline font-bold">Why PlayVerse?</h2>
            <p className="mt-2 text-lg text-muted-foreground">The ultimate gaming playground.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
            <Card 
                key={feature.title} 
                className="glass-card text-center animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
            >
                <CardHeader>
                <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                </div>
                </CardHeader>
                <CardContent>
                <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </CardContent>
            </Card>
            ))}
        </div>
      </div>
    </PageShell>
  );
}
