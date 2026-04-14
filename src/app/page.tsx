
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Users, Heart, Lock } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Shield className="h-6 w-6 text-primary mr-2" />
          <span className="font-headline font-bold text-xl tracking-tight text-primary">ResQMate</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 flex items-center" href="/login">
            Login
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 text-primary-foreground">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Immediate Action. Collective Impact.
                  </h1>
                  <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                    ResQMate connects NGOs with qualified volunteers in real-time to streamline relief efforts and save lives.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register?role=ngo">
                    <Button variant="secondary" size="lg" className="w-full min-[400px]:w-auto">
                      Join as NGO
                    </Button>
                  </Link>
                  <Link href="/register?role=volunteer">
                    <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-white/10">
                      Become a Volunteer
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto flex w-full items-center justify-center">
                <div className="relative h-[300px] w-full overflow-hidden rounded-xl shadow-2xl lg:h-[450px]">
                  <Image
                    src={heroImage?.imageUrl || ""}
                    alt="Humanitarian relief"
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage?.imageHint}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Engineered for Crisis</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is designed for rapid response and reliable coordination in demanding situations.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <Zap className="h-10 w-10 text-destructive mb-2" />
                  <CardTitle>Rapid Deployment</CardTitle>
                </CardHeader>
                <CardContent>
                  NGOs can post tasks in seconds. Our AI assistant helps craft clear descriptions for maximum clarity.
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader>
                  <Users className="h-10 w-10 text-secondary mb-2" />
                  <CardTitle>Smart Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  Volunteers are matched based on GPS location and verified skills, ensuring the right people are on site.
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader>
                  <Heart className="h-10 w-10 text-accent mb-2" />
                  <CardTitle>Impact Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  Verify task completion and recognize volunteer efforts through our points and verification system.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted/30">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">© 2024 ResQMate. Dedicated to Humanitarian Excellence.</p>
          <div className="flex gap-4">
            <Link className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold" href="/admin/login">
              <Lock className="h-3 w-3" /> Developer Admin Portal
            </Link>
          </div>
        </div>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
