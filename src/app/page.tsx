import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Heart, ArrowRight, Activity, Globe, Users, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-8 h-24 flex items-center nav-blur">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-xl shadow-primary/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">ResQMate</span>
        </Link>
        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="/login">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="rounded-2xl px-8 h-12 font-black shadow-2xl shadow-primary/20">Get Started</Button>
          </Link>
        </nav>
      </header>
      
      <main className="flex-1">
        <section className="relative w-full py-24 lg:py-32 overflow-hidden hero-gradient">
          <div className="container px-8 mx-auto relative z-10">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="flex flex-col space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                    <Activity className="h-3.5 w-3.5" /> Next-Gen Coordination Layer
                  </div>
                  <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-slate-950">
                    Deploy <span className="text-primary">Impact</span>.<br />Mobilize <span className="text-accent">Hope</span>.
                  </h1>
                  <p className="max-w-[580px] text-slate-600 text-xl font-medium leading-relaxed">
                    ResQMate bridges the gap between verified global responders and NGOs, providing the technical backbone for rapid humanitarian operations.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link href="/register?role=ngo">
                    <Button size="lg" className="w-full sm:w-auto rounded-[1.5rem] h-20 px-10 text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105">
                      NGO Command Hub
                    </Button>
                  </Link>
                  <Link href="/register?role=volunteer">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-[1.5rem] h-20 px-10 text-xl font-black border-4 border-slate-100 hover:border-primary/20 bg-white/50 backdrop-blur-sm transition-all hover:scale-105">
                      Join Responders
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-12 w-12 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden relative shadow-lg">
                         <Image src={`https://picsum.photos/seed/face${i+10}/100/100`} alt="user" fill className="object-cover" />
                      </div>
                    ))}
                    <div className="h-12 w-12 rounded-2xl border-4 border-white bg-slate-950 flex items-center justify-center text-[10px] font-black text-white shadow-lg">+12K</div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Readiness Globally</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-10 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full blur-[120px] animate-pulse" />
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[3.5rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] border-[16px] border-white">
                  <Image
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/relief/1200/800"}
                    alt="Humanitarian relief"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute bottom-10 left-10 right-10 glass-panel rounded-3xl p-8 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Active Deployments</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">4,891 Tasks</p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-200">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-32 bg-white">
          <div className="container px-8 mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-24">
              <h2 className="text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter leading-none">Built for High-Stakes Operations</h2>
              <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Standardizing humanitarian response through AI-driven matching and secure authentication.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Rapid Dispatch",
                  desc: "Use Genkit AI to transform brief mission requirements into professional, structured deployment briefs in seconds.",
                  color: "text-blue-600",
                  bg: "bg-blue-50"
                },
                {
                  icon: ShieldCheck,
                  title: "Verified Networks",
                  desc: "Every responder and NGO undergoes a strict administrative review to ensure the highest standards of on-site operations.",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50"
                },
                {
                  icon: Heart,
                  title: "Impact Analytics",
                  desc: "Track every hour contributed and mission completed with a transparent ledger of humanitarian impact and verified success.",
                  color: "text-rose-600",
                  bg: "bg-rose-50"
                }
              ].map((f, i) => (
                <div key={i} className="premium-card p-12 group">
                  <div className={`h-24 w-24 ${f.bg} ${f.color} rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-12 w-12" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-950 mb-4 tracking-tighter">{f.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed mb-10">{f.desc}</p>
                  <Button variant="ghost" className="p-0 text-primary font-black hover:bg-transparent group-hover:translate-x-3 transition-transform">
                    Protocol Details <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t border-slate-100 bg-slate-50">
        <div className="container px-8 mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-8">
            <Link className="flex items-center gap-3" href="/">
              <div className="bg-slate-950 p-2 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter">ResQMate</span>
            </Link>
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">The professional standard for humanitarian relief coordination and responder mobilization.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-20">
            <div className="flex flex-col gap-5">
              <span className="font-black text-slate-950 uppercase text-xs tracking-[0.3em]">Platform</span>
              <Link href="#" className="text-slate-500 font-bold hover:text-primary">Mission Map</Link>
              <Link href="#" className="text-slate-500 font-bold hover:text-primary">NGO Command</Link>
              <Link href="#" className="text-slate-500 font-bold hover:text-primary">Responder Hub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}