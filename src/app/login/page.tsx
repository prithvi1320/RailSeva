"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState<'enter-mobile' | 'enter-otp'>('enter-mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsLoading(true);
    console.log(`Sending OTP to ${mobile}`);
    setTimeout(() => {
      setIsLoading(false);
      setStep('enter-otp');
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    console.log(`Verifying OTP ${otp}`);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/portal');
    }, 1000);
  };

  const AppLogo = () => (
    <div className="flex items-center gap-2">
        <div className="bg-accent p-1.5 rounded-md leading-none">
            <span className="font-bold text-accent-foreground text-lg">RS</span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-primary">
            RAILSEVA
        </h1>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" asChild>
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
        </Button>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className='mx-auto mb-4'>
            <AppLogo/>
          </div>
          <CardTitle className="text-2xl font-headline">
            {step === 'enter-mobile' ? 'Login or Register' : 'Verify OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'enter-mobile'
              ? 'Enter your mobile number to continue.'
              : `An OTP has been sent to ${mobile}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'enter-mobile' ? (
            <form onSubmit={handleGetOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="flex items-center">
                  <span className="h-10 flex items-center justify-center rounded-l-md border border-r-0 bg-muted px-3 text-sm">+91</span>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="00000 00000"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="rounded-l-none"
                    pattern="\d{10}"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Get OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  pattern="\d{6}"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify OTP'}
              </Button>
            </form>
          )}
        </CardContent>
        {step === 'enter-otp' && (
          <CardFooter className="flex flex-col items-center justify-center text-sm">
            <p className="text-muted-foreground">Didn't receive the code?</p>
            <div className='flex gap-1'>
                <Button variant="link" size="sm" onClick={() => setStep('enter-mobile')}>
                    Change number
                </Button>
                <span className='text-muted-foreground'>or</span>
                <Button variant="link" size="sm" onClick={() => alert("Resending OTP...")}>
                    Resend OTP
                </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
