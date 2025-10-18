
import { PageShell } from '@/components/page-shell';
import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] animate-fade-in">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
                <div className="bg-primary/20 p-4 rounded-full w-fit">
                    <Wallet className="h-8 w-8 text-primary" />
                </div>
            </div>
            <CardTitle className="font-headline text-3xl">Login</CardTitle>
            <CardDescription>Enter your credentials to continue your journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
             <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-accent hover:text-accent/80">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
