
"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowRight, Shield, Zap, MapPin, 
  CheckCircle, ShieldCheck, Globe, 
  Lock, ArrowLeft, Users, BrainCircuit
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

const logoAsset = PlaceHolderImages.find(img => img.id === 'main-logo');
const heroAsset = PlaceHolderImages.find(img => img.id === 'how-it-works-hero');

const Step = ({ number, title, desc, icon: Icon, color }: any) => (
  <div className="relative group">
    <div className="absolute -inset-4 bg-white rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100 shadow-xl" />
    <div className="relative flex gap-8">
      <div className={`h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${color} text-white`}>
        {number}
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-slate-400" />
          <h3 className="text-2xl font-black tracking-tight text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-7 pb-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg">
            {logoAsset && <Image src={logoAsset.imageUrl} alt="Logo" width={40} height={40} className="object-cover" />}
          </div>
          <span className="text-base font-black tracking-tight" style={{ color: "#34535E" }}>ResQMate</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
          </Link>
          <Link href="/login?mode=register">
            <Button className="rounded-xl font-bold bg-slate-900 shadow-lg">Join Network</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16 space-y-32">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase text-primary tracking-widest">Orchestration Protocol</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-950 max-w-4xl mx-auto leading-tight">
            Connecting Intent with <span className="text-primary">Operational Reality.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            ResQMate isn't just a platform; it's a high-performance engine for humanitarian coordination, designed to remove every second of friction between a need and a response.
          </p>
          <div className="relative aspect-[21/9] w-full rounded-[3rem] overflow-hidden shadow-2xl">
             {heroAsset && <Image src={heroAsset.imageUrl} alt="System Architecture" fill className="object-cover" />}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
          </div>
        </section>

        {/* The Four Pillars */}
        <section className="grid md:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-slate-900">The Deployment Cycle</h2>
              <p className="text-slate-500 font-medium">Our four-stage protocol ensures every mission is valid, efficient, and verified.</p>
            </div>
            
            <div className="space-y-12">
              <Step 
                number="01" 
                icon={Shield} 
                color="bg-slate-900" 
                title="Command Initiation" 
                desc="NGOs deploy mission parameters—skills, urgency, and location. Our AI optimization layer ensures descriptions are clear and compelling for responders."
              />
              <Step 
                number="02" 
                icon={BrainCircuit} 
                color="bg-primary" 
                title="Intelligence Matching" 
                desc="The system scans the live network for certified responders within the operational sector. AI analyzes skill-fit and proximity to find the ideal match."
              />
              <Step 
                number="03" 
                icon={MapPin} 
                color="bg-accent" 
                title="Tactical Deployment" 
                desc="Responders receive instant alerts on their mobile terminals. Once engaged, they are guided by real-time mission intelligence to the site."
              />
              <Step 
                number="04" 
                icon={ShieldCheck} 
                color="bg-emerald-500" 
                title="Immutable Verification" 
                desc="Completion is verified on-site via secure QR handoff between the responder and NGO. Points are awarded, and impact is logged to the network's audit trail."
              />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-[120px] -z-10" />
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-8">
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Network Status</h4>
                  <p className="text-xl font-black text-slate-900">340+ Certified NGOs</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <Globe className="h-8 w-8 text-emerald-500" />
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Coverage</h4>
                  <p className="text-xl font-black text-slate-900">Global Sector Sync</p>
                </div>
              </div>
              <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Security Layer Active</span>
                </div>
                <p className="text-sm font-medium text-slate-400">All responder credentials undergo rigorous verification before entering the active network pool.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 rounded-[3.5rem] p-16 md:p-24 text-center space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
           <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter relative z-10">Ready to join the response?</h2>
           <p className="text-slate-400 font-medium text-xl max-w-xl mx-auto relative z-10">Deploy your organization or register as an independent responder today.</p>
           <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <Link href="/login?mode=register">
                <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-slate-950 font-black text-lg hover:scale-105 transition-transform">Get Started</Button>
              </Link>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg overflow-hidden shadow">
              {logoAsset && <Image src={logoAsset.imageUrl} alt="Logo" width={32} height={32} className="object-cover" />}
            </div>
            <span className="font-black text-slate-900 tracking-tight">ResQMate</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} ResQMate Core Operations.</p>
        </div>
      </footer>
    </div>
  );
}
