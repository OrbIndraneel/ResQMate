import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Users, Heart, Lock, ArrowRight, Globe, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/20">
      <header className="px-6 lg:px-12 h-20 flex items-center border-b bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <Link className="flex items-center group" href="/">
          <div className="bg-primary p-1.5 rounded-lg mr-3 group-hover:rotate-6 transition-transform">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">ResQMate</span>
        </Link>
        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="/login">
            Login
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 lg:py-32 overflow-hidden gradient-bg">
          <div className="container px-6 mx-auto relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col space-y-8 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4">
                  <Globe className="h-3 w-3" /> Global Relief Network
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                  Respond <span className="text-primary italic">Faster</span>. <br />Impact Further.
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  The world's most advanced coordination platform connecting NGOs with elite, verified volunteers in real-time. Designed for speed, built for impact.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register?role=ngo">
                    <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl group">
                      Join as NGO <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/register?role=volunteer">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl border-2 hover:bg-slate-50 transition-all">
                      Become a Volunteer
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 pt-4 text-sm text-slate-400 font-semibold">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Verified NGO Network</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Real-time Matching</div>
                </div>
              </div>
              <div className="relative animate-in zoom-in duration-1000">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative h-[500px] w-full overflow-hidden rounded-[3rem] shadow-2xl border-8 border-white">
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

        {/* Features Section */}
        <section className="w-full py-24 bg-white">
          <div className="container px-6 mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-20">
              <h2 className="text-4xl font-black tracking-tighter sm:text-5xl text-slate-900">Coordination for the Frontline</h2>
              <p className="max-w-[800px] text-slate-500 text-lg font-medium">
                ResQMate bridges the gap between chaos and coordination with AI-powered tasking and smart logistics.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: Zap,
                  title: "Rapid Deployment",
                  desc: "NGOs can post tasks in seconds. Our AI assistant helps craft clear descriptions for maximum volunteer clarity.",
                  color: "bg-blue-500",
                  light: "bg-blue-50"
                },
                {
                  icon: Users,
                  title: "Smart Matching",
                  desc: "Volunteers are matched based on geolocation and verified certifications, ensuring high-quality site presence.",
                  color: "bg-teal-500",
                  light: "bg-teal-50"
                },
                {
                  icon: Heart,
                  title: "Impact Verification",
                  desc: "Track real-time progress and recognize volunteer contributions through our points and digital certification system.",
                  color: "bg-rose-500",
                  light: "bg-rose-50"
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-[2.5rem] bg-slate-50 hover:bg-white border-2 border-transparent hover:border-slate-100 hover:shadow-2xl transition-all duration-500">
                  <div className={`${feature.light} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 ${feature.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t bg-slate-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-2">
              <Link className="flex items-center" href="/">
                <Shield className="h-6 w-6 text-primary mr-2" />
                <span className="font-headline font-black text-xl tracking-tighter text-slate-900">ResQMate</span>
              </Link>
              <p className="text-xs text-slate-400 font-semibold tracking-wide">© 2024 RESQMATE OPERATIONS. ALL RIGHTS RESERVED.</p>
            </div>
            <div className="flex items-center gap-8">
              <Link className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-2 uppercase tracking-widest" href="/admin/login">
                <Lock className="h-3 w-3" /> Dev Admin
              </Link>
              <nav className="flex gap-6">
                <Link className="text-xs font-bold text-slate-400 hover:text-primary uppercase tracking-widest" href="#">Terms</Link>
                <Link className="text-xs font-bold text-slate-400 hover:text-primary uppercase tracking-widest" href="#">Privacy</Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}