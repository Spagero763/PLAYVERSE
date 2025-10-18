import { Suspense } from 'react';
import { PageShell } from '@/components/page-shell';
import { LobbyRoom } from '@/components/lobby-room';
import { Loader2 } from 'lucide-react';

function LobbyContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const game = searchParams?.game;
  const gameName = typeof game === 'string' ? game : 'the game';

  return <LobbyRoom game={gameName} />;
}

export default async function LobbyPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  return (
    <PageShell>
       <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
         <Suspense fallback={
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin"/>
                <p>Loading lobby...</p>
            </div>
         }>
         <LobbyContent searchParams={sp} />
        </Suspense>
      </div>
    </PageShell>
  );
}
