import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Users, Heart, Lock, ArrowRight, CheckCircle2, Globe } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-20 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2 group" href="/">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline font-extrabold text-2xl tracking-tighter text-slate-900">ResQMate</span>
        </Link>
        <nav className="ml-auto flex items-center gap-6">
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="/login">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">Get Started</Button>
          </Link>
        </nav>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 lg:py-32 overflow-hidden hero-gradient">
          <div className="container px-6 mx-auto relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <Globe className="h-3 w-3" /> Global Crisis Coordination
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
                    Response <span className="text-primary italic">Faster</span>. <br />
                    Impact <span className="text-accent underline decoration-accent/30">Deeper</span>.
                  </h1>
                  <p className="max-w-[540px] text-slate-600 text-lg lg:text-xl leading-relaxed">
                    ResQMate is the world's most agile coordination layer for humanitarian relief, connecting NGO logistics with verified professional volunteers in seconds.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register?role=ngo">
                    <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20">
                      I'm an NGO Admin
                    </Button>
                  </Link>
                  <Link href="/register?role=volunteer">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold border-2 hover:bg-slate-50">
                      Volunteer as Responder
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 pt-4 text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" /> <span className="text-sm">Verified Credentials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" /> <span className="text-sm">Real-time Matching</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
                  <Image
                    src={heroImage?.imageUrl || ""}
                    alt="Humanitarian relief"
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                    data-ai-hint={heroImage?.imageHint}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-24 bg-white">
          <div className="container px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">The Future of Relief Coordination</h2>
              <p className="text-slate-500 text-lg">Every second counts in a crisis. Our infrastructure is built to eliminate bureaucratic friction and maximize human impact.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Rapid Tasking",
                  desc: "Post complex relief requirements in seconds. Our AI ensures task descriptions are professional, clear, and ready for immediate action.",
                  color: "text-amber-500",
                  bg: "bg-amber-50"
                },
                {
                  icon: Globe,
                  title: "AI Matching",
                  desc: "Precision matching based on verified skills, proximity, and urgency. Get the right professionals to the right coordinates automatically.",
                  color: "text-blue-500",
                  bg: "bg-blue-50"
                },
                {
                  icon: Heart,
                  title: "Impact Verified",
                  desc: "Transparent tracking of relief hours and points. Recognize excellence in humanitarian work through our immutable verification system.",
                  color: "text-rose-500",
                  bg: "bg-rose-50"
                }
              ].map((f, i) => (
                <Card key={i} className="border-none shadow-xl hover:shadow-2xl transition-shadow group rounded-3xl overflow-hidden bg-slate-50/50">
                  <CardContent className="p-10 space-y-6">
                    <div className={`h-16 w-16 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <f.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">{f.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
                    </div>
                    <Button variant="ghost" className="p-0 text-primary font-bold hover:bg-transparent group-hover:gap-2 transition-all">
                      Learn More <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-slate-50">
        <div className="container px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-4">
            <Link className="flex items-center gap-2" href="/">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-xl tracking-tighter">ResQMate</span>
            </Link>
            <p className="text-xs text-slate-500 max-w-xs">Connecting the world's most dedicated organizations with verified emergency responders.</p>
            <Link href="/admin/login" className="text-[10px] text-slate-400 hover:text-primary flex items-center gap-1 font-bold uppercase tracking-widest">
              <Lock className="h-3 w-3" /> Secure Admin Portal
            </Link>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-slate-900">Platform</span>
              <Link href="#" className="text-slate-500 hover:text-primary transition-colors">Emergency Tasks</Link>
              <Link href="#" className="text-slate-500 hover:text-primary transition-colors">NGO Partnership</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-bold text-slate-900">Support</span>
              <Link href="#" className="text-slate-500 hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-slate-500 hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="container px-6 mx-auto pt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          © 2024 ResQMate Humanitarian Systems • All Rights Reserved
        </div>
      </footer>
    </div>
  );
}