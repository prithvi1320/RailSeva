"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightToLine, Loader2, Mail, Lock } from 'lucide-react';
import { RailMadadHeader } from '@/components/layout/rail-madad-header';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setIsLoading(true);
    const isAdmin = email.toLowerCase() === 'admin@railmadad.com' && password === 'admin123';

    setTimeout(() => {
      setIsLoading(false);
      router.push(isAdmin ? '/portal/admin' : '/portal');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <RailMadadHeader />
      <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1280px] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl rounded-2xl border bg-white shadow-sm">
          <CardHeader className="space-y-5 pt-10 text-center">
            <div className="mx-auto inline-flex rounded-xl bg-accent p-5 text-white">
              <ArrowRightToLine className="h-10 w-10" />
            </div>
            <CardTitle className="font-headline text-6xl font-semibold uppercase text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-2xl text-muted-foreground">Login to Rail Madad Complaint System</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-3xl font-semibold text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 text-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-3xl font-semibold text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 text-xl"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="h-14 w-full font-headline text-3xl uppercase tracking-wide" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8 pt-2">
            <p className="text-xl text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/login" className="font-semibold text-accent hover:underline">
                Register here
              </Link>
            </p>
            <div className="w-full rounded-lg border bg-muted px-4 py-3 text-center text-lg text-muted-foreground">
              Admin Login: admin@railmadad.com / admin123
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
