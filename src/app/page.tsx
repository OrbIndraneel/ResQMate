import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Zap, Heart, ArrowRight, CheckCircle2, Globe, Activity, Users } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-8 h-24 flex items-center nav-blur">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">ResQMate</span>
        </Link>
        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="/login">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="rounded-2xl px-8 h-12 font-black shadow-xl shadow-primary/20">Get Started</Button>
          </Link>
        </nav>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-24 lg:py-32 overflow-hidden hero-gradient">
          <div className="container px-8 mx-auto relative z-10">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="flex flex-col space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                    <Activity className="h-3.5 w-3.5" /> Next-Gen Relief Coordination
                  </div>
                  <h1 className="text-6xl lg:text-8xl font-black leading-[1] tracking-tighter text-slate-950">
                    Respond <span className="text-primary">Faster</span>.<br />Save <span className="text-accent">More</span>.
                  </h1>
                  <p className="max-w-[540px] text-slate-600 text-xl font-medium leading-relaxed">
                    Connecting global NGO networks with professional, verified emergency responders in real-time. Eliminating friction where every second counts.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link href="/register?role=ngo">
                    <Button size="lg" className="w-full sm:w-auto rounded-2xl h-16 px-10 text-lg font-black shadow-2xl shadow-primary/30">
                      Deploy as NGO
                    </Button>
                  </Link>
                  <Link href="/register?role=volunteer">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl h-16 px-10 text-lg font-black border-2 border-slate-200 hover:bg-white hover:border-primary/20">
                      Join as Responder
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative">
                         <Image src={`https://picsum.photos/seed/face${i}/100/100`} alt="user" fill className="object-cover" />
                      </div>
                    ))}
                    <div className="h-10 w-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-black text-white">+5K</div>
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trusted by Global Entities</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-[100px] animate-pulse" />
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-[12px] border-white">
                  <Image
                    src={heroImage?.imageUrl || ""}
                    alt="Humanitarian relief"
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage?.imageHint}
                  />
                  <div className="absolute bottom-8 left-8 right-8 glass-panel rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Operations</p>
                      <p className="text-2xl font-black text-slate-900">2,482 Tasks</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-32 bg-white">
          <div className="container px-8 mx-auto">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-24">
              <h2 className="text-5xl font-black text-slate-950 tracking-tighter">Engineered for Human Impact</h2>
              <p className="text-slate-500 text-xl font-medium">Bypass bureaucratic bottlenecks with our AI-driven coordination layer.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Rapid Deployment",
                  desc: "Generate professional tasking profiles in seconds with AI. Mobilize resources before the news even hits the wire.",
                  color: "text-blue-600",
                  bg: "bg-blue-50"
                },
                {
                  icon: Globe,
                  title: "Precision Matching",
                  desc: "AI identifies the exact skills and proximity needed for each mission, ensuring no talent or time is wasted.",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50"
                },
                {
                  icon: Heart,
                  title: "Verified Excellence",
                  desc: "A transparent system for tracking impact and recognizing the heroes on the front lines of global crises.",
                  color: "text-rose-600",
                  bg: "bg-rose-50"
                }
              ].map((f, i) => (
                <div key={i} className="premium-card p-10 group cursor-default">
                  <div className={`h-20 w-20 ${f.bg} ${f.color} rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 mb-4">{f.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed mb-8">{f.desc}</p>
                  <Button variant="ghost" className="p-0 text-primary font-black hover:bg-transparent group-hover:translate-x-2 transition-transform">
                    Explore Infrastructure <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-slate-100 bg-slate-50">
        <div className="container px-8 mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6">
            <Link className="flex items-center gap-3" href="/">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-black text-2xl tracking-tighter">ResQMate</span>
            </Link>
            <p className="text-slate-500 font-medium max-w-sm">The world's most agile coordination layer for humanitarian relief and emergency response.</p>
            <div className="flex gap-4">
              <Link href="/admin/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                <Shield className="h-3 w-3" /> Secure Node Access
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            <div className="flex flex-col gap-4">
              <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Platform</span>
              <Link href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Mission Map</Link>
              <Link href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">NGO Command</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Protocol</span>
              <Link href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Security Docs</Link>
              <Link href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Privacy Shield</Link>
            </div>
          </div>
        </div>
        <div className="container px-8 mx-auto pt-20 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© 2024 ResQMate Global Systems • Decentralized Response Network</p>
        </div>
      </footer>
    </div>
  );
}