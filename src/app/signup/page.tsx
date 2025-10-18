
import { PageShell } from '@/components/page-shell';
import { SignupForm } from '@/components/signup-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] animate-fade-in">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <div className="bg-primary/20 p-4 rounded-full w-fit">
                    <UserPlus className="h-8 w-8 text-primary" />
                </div>
            </div>
            <CardTitle className="font-headline text-3xl">Create Your Account</CardTitle>
            <CardDescription>Join the PlayVerse and start your gaming legacy today.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-accent hover:text-accent/80">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
