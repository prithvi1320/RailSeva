import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Search, FilePlus, Users } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const AppLogo = () => (
  <div className="flex items-center gap-2">
      <div className="bg-accent p-1.5 rounded-md leading-none">
          <span className="font-bold text-accent-foreground text-lg">RS</span>
      </div>
      <h1 className="font-headline text-2xl font-bold text-inherit">
          RAILSEVA
      </h1>
  </div>
);

const featureCards = [
  {
    icon: FilePlus,
    title: 'Effortless Submission',
    description: 'Quickly file complaints or suggestions using our streamlined form.',
  },
  {
    icon: Mic,
    title: 'Voice-to-Text AI',
    description: 'Use your voice to describe your issue, and our AI will transcribe it for you.',
  },
  {
    icon: Search,
    title: 'Real-Time Tracking',
    description: 'Track the status of your submitted grievances with a unique complaint ID.',
  },
  {
    icon: Users,
    title: 'Dedicated Admin Panel',
    description: 'An internal portal for railway authorities to manage and resolve complaints efficiently.',
  },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-primary">
            <AppLogo />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative text-primary-foreground">
          <div className="absolute inset-0">
            {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  className="object-cover"
                  priority
                />
            )}
            <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/90 to-background" />

          </div>

          <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-24 md:py-32">
            <div className="flex flex-col gap-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline font-bold">
                RAILSEVA
              </h1>
              <p className="text-lg text-primary-foreground/90 max-w-lg">
                Your Voice Matters. Report railway complaints instantly. A dedicated platform for Indian Railway passengers to voice their concerns and contribute to service improvement.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">A PLATFORM FOR CHANGE</h2>
              <p className="text-lg text-muted-foreground mt-2">File, track, and resolve your railway grievances with ease.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureCards.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="pt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/50">
        <div className="container flex flex-col md:flex-row items-center justify-between py-6 gap-4">
          <div className="text-primary">
            <AppLogo />
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RailSeva by Prithvi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
