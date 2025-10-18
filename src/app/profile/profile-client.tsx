
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge as BadgeIcon, User } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProfileClientPage({ profile }: { profile: UserProfile | null }) {
  
  if (!profile) {
     return (
        <PageShell>
            <div className="flex flex-col items-center justify-center text-center py-24 animate-fade-in">
                <div className="bg-primary/10 p-6 rounded-full mb-6">
                    <User className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-4xl font-headline font-bold">No Profile Found</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Create an account to build your player profile and track your stats.
                </p>
                <div className="mt-8 flex gap-4">
                     <Link href="/signup" passHref>
                        <Button>Create Account</Button>
                    </Link>
                    <Link href="/login" passHref>
                        <Button variant="secondary">Login</Button>
                    </Link>
                </div>
            </div>
        </PageShell>
     )
  }
  
  const totalWins = (profile.stats || []).reduce((acc, stat) => acc + stat.wins, 0);
  const xp = profile.xp || 0;

  return (
    <PageShell>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-8 animate-slide-up">
          <Card className="glass-card text-center">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                  {profile.avatar && <AvatarImage src={profile.avatar} alt={profile.name} />}
                  <AvatarFallback className="text-4xl bg-secondary">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                 <span className="absolute bottom-0 right-0 block h-8 w-8 rounded-full border-2 border-background bg-primary p-1.5 text-xs font-bold">{Math.floor(xp / 100)}</span>
              </div>
              <h1 className="text-3xl font-bold font-headline">{profile.name}</h1>
              <p className="text-accent">{profile.rank}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {profile.badges && profile.badges.length > 0 ? profile.badges.map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    <BadgeIcon className="h-3.5 w-3.5 text-primary"/>
                    {badge}
                  </span>
                )) : <p className="text-sm text-muted-foreground">No badges earned yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right Column: Stats */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="glass-card animate-slide-up" style={{animationDelay: '200ms'}}>
              <CardHeader>
                <CardTitle className="font-headline">Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={profile.stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.1)" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                    <Bar dataKey="wins" fill="hsl(var(--primary))" name="Wins" />
                    <Bar dataKey="gamesPlayed" fill="hsl(var(--accent))" name="Games Played" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
             <Card className="glass-card animate-slide-up" style={{animationDelay: '300ms'}}>
              <CardHeader>
                <CardTitle className="font-headline">All-Time Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-center">
                  <div className="glass-card p-4 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{totalWins}</p>
                      <p className="text-sm text-muted-foreground">Total Wins</p>
                  </div>
                   <div className="glass-card p-4 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{xp}</p>
                      <p className="text-sm text-muted-foreground">Total XP</p>
                  </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </PageShell>
  );
}
