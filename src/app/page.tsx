import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Trash2, Users, FileText, Search, ClipboardCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { RailMadadHeader } from '@/components/layout/rail-madad-header';

const categoryCards = [
  {
    icon: Trash2,
    title: 'CLEANLINESS',
    description: 'Report coach cleaning, washroom maintenance, and station hygiene issues.',
  },
  {
    icon: Shield,
    title: 'SECURITY',
    description: 'Report safety concerns, suspicious activity, and emergency incidents.',
  },
  {
    icon: Users,
    title: 'STAFF BEHAVIOR',
    description: 'Report misconduct, service quality concerns, or unprofessional behavior.',
  },
  {
    icon: FileText,
    title: 'FOOD QUALITY',
    description: 'Raise complaints related to catering quality and pantry service.',
  },
  {
    icon: Search,
    title: 'TRAIN DELAY',
    description: 'Submit delay and schedule disruption complaints with journey context.',
  },
  {
    icon: ClipboardCheck,
    title: 'OTHER ISSUES',
    description: 'Submit any other railway issue with image, audio, or video evidence.',
  },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

  return (
    <div className="min-h-screen bg-background">
      <RailMadadHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden text-primary-foreground">
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
            <div className="absolute inset-0 bg-[#163f97]/85" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#163f97]/75 via-[#163f97]/90 to-[#e8edf7]" />
          </div>

          <div className="container relative py-16 md:py-24">
            <div className="max-w-4xl space-y-8">
              <h1 className="font-headline text-6xl font-bold uppercase tracking-tight md:text-8xl">
                RAIL MADAD
              </h1>
              <p className="max-w-4xl text-3xl leading-tight text-white/90 md:text-5xl">
                Your Voice Matters. Report railway complaints instantly with text, images, audio, and video evidence.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild className="h-14 rounded-lg px-9 font-headline text-2xl uppercase tracking-wide">
                  <Link href="/login">Get Started</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-lg border-white bg-transparent px-9 font-headline text-2xl uppercase tracking-wide text-white hover:bg-white hover:text-accent"
                >
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-6xl font-bold uppercase text-foreground md:text-7xl">Complaint Categories</h2>
              <p className="mt-3 text-2xl text-muted-foreground">Report issues across multiple railway service areas</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {categoryCards.map((item) => (
                <Card key={item.title} className="rounded-2xl border bg-white shadow-sm">
                  <CardContent className="space-y-6 p-8">
                    <div className="inline-flex rounded-xl bg-[#edf2fc] p-4 text-accent">
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-headline text-4xl font-semibold uppercase text-foreground">{item.title}</h3>
                    <p className="text-xl leading-relaxed text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="bg-muted py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-6xl font-bold uppercase text-foreground md:text-7xl">How It Works</h2>
              <p className="mt-3 text-2xl text-muted-foreground">Simple 3-step process to file your complaint</p>
            </div>
            <div className="grid gap-10 md:grid-cols-3">
              {[
                { step: "1", title: "Register", text: "Create your account with basic details. Quick and secure registration process." },
                { step: "2", title: "Submit Complaint", text: "Describe your issue with text, images, audio, or video evidence for faster resolution." },
                { step: "3", title: "Track Status", text: "Monitor your complaint status in real-time and receive regular updates." },
              ].map((item, index) => (
                <div key={item.title} className="text-center">
                  <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full text-6xl font-bold text-white ${index === 1 ? "bg-primary" : "bg-accent"}`}>
                    {item.step}
                  </div>
                  <h3 className="font-headline text-4xl font-semibold uppercase text-foreground">{item.title}</h3>
                  <p className="mx-auto mt-3 max-w-sm text-xl leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-accent py-6 text-center text-base text-white/90">
        <div className="container">&copy; {new Date().getFullYear()} Rail Madad. All rights reserved.</div>
      </footer>
    </div>
  );
}
