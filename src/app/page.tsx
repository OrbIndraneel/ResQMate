
"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Shield, Globe, CheckCircle,
  Activity, MapPin, Users, Clock, ChevronRight,
  Heart, Star, Bell, TrendingUp, Zap, Check, Lock,
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const logoAsset = PlaceHolderImages.find(img => img.id === 'main-logo');

/* ─── Animated Counter ───────────────────────────── */
const AnimCounter = memo(function AnimCounter({ to, suffix = "" }: { to: number, suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1400;
    const step = 16;
    const increment = to / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setVal(to);
        clearInterval(timer);
      } else {
        setVal(Math.floor(start));
      }
    }, step);
    return () => setInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
});

/* ─── Scroll-reveal wrapper ──────────────────────── */
const Reveal = memo(function Reveal({ children, delay = 0, className = "", direction = "up" }: { children: React.ReactNode, delay?: number, className?: string, direction?: "up" | "left" | "right" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  const initial =
    direction === "left"  ? { opacity: 0, x: -36 } :
    direction === "right" ? { opacity: 0, x:  36 } :
                            { opacity: 0, y:  28 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

/* ─── Abstract SVG Hero Illustration ─────────────── */
const HeroIllustration = memo(function HeroIllustration() {
  const nodes = [
    { label: "GPS Match",   Icon: Globe,       angle: -55, r: 130, color: "#34535E" },
    { label: "QR Verify",  Icon: Shield,      angle:  35, r: 130, color: "#ffffff" },
    { label: "Live Alert", Icon: Bell,        angle: 130, r: 130, color: "#34535E" },
    { label: "Task Done",  Icon: CheckCircle, angle: 225, r: 130, color: "#ffffff" },
  ];

  return (
    <div className="relative w-[340px] h-[340px] flex-shrink-0 select-none pointer-events-none mx-auto scale-[0.75] sm:scale-100 origin-center">
      {/* Glow */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 70%)" }} />

      {/* Orbit rings */}
      <svg className="absolute inset-0 w-full h-full opacity-30 animate-orbit-reverse" viewBox="0 0 340 340">
        <circle cx="170" cy="170" r="155" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeDasharray="6 10" />
      </svg>
      <svg className="absolute inset-0 w-full h-full opacity-20 animate-orbit" viewBox="0 0 340 340">
        <circle cx="170" cy="170" r="110" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1" strokeDasharray="4 8" />
      </svg>

      {/* Pulse rings */}
      <div className="absolute animate-pulse-ring top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white/40" />
      <div className="absolute animate-pulse-ring top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white/25" style={{ animationDelay: "0.9s" }} />

      {/* Center core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[86px] h-[86px] flex items-center justify-center rounded-[1.8rem] bg-white border-4 border-white shadow-2xl animate-float overflow-hidden">
        {logoAsset && (
          <Image 
            src={logoAsset.imageUrl} 
            alt="ResQMate Core" 
            width={80} 
            height={80} 
            className="object-cover"
            data-ai-hint={logoAsset.imageHint}
          />
        )}
      </div>

      {/* Orbiting nodes */}
      {nodes.map(({ label, Icon, angle, r, color }, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.round((170 + Math.cos(rad) * r - 38) * 100) / 100;
        const y = Math.round((170 + Math.sin(rad) * r - 30) * 100) / 100;
        const isBright = color === "#ffffff";
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 220, damping: 18 }}
            className="absolute flex flex-col items-center gap-1 px-3 py-2 rounded-xl backdrop-blur-[6px] min-w-[76px]"
            style={{
              left: `${x}px`, top: `${y}px`,
              background: isBright ? "rgba(255,255,255,0.92)" : "rgba(52,83,94,0.85)",
              border: `1px solid ${isBright ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)"}`,
            }}
          >
            <Icon size={13} style={{ color: isBright ? "#2B7B7B" : "#ffffff" }} strokeWidth={2.5} />
            <span className="text-[9px] font-bold whitespace-nowrap" style={{ color: isBright ? "#34535E" : "#e2f0ef" }}>{label}</span>
          </motion.div>
        );
      })}
    </div>
  );
});

/* ─── Main Landing ───────────────────────────────── */
export default function Home() {
  const stats = [
    { label: "Active NGOs",    value: 340,   suffix: "+", icon: Users,    color: "#34535E" },
    { label: "Tasks Deployed", value: 12000, suffix: "+", icon: Activity, color: "#2B7B7B" },
    { label: "Volunteers",     value: 1200,  suffix: "+", icon: Heart,    color: "#57A498" },
    { label: "Avg Response",   value: null,  display: "<4m", icon: Clock,  color: "#16a34a" },
  ];

  const features = [
    { icon: MapPin,      color: "#2B7B7B",  title: "GPS-Based Matching",    desc: "Instantly match volunteers to emergencies using real-time geolocation — zero manual dispatch needed." },
    { icon: Shield,      color: "#34535E",  title: "QR Verified Handoffs",  desc: "Every task completion is cryptographically verified via QR scan, creating an immutable audit trail." },
    { icon: Bell,        color: "#CF223B",  title: "Real-Time Alerts",      desc: "Push-based emergency broadcasts reach the nearest certified volunteers in under 30 seconds." },
    { icon: TrendingUp,  color: "#57A498",  title: "Impact Analytics",      desc: "Live leaderboards and metrics keep volunteers motivated and organizations accountable." },
    { icon: Users,       color: "#7c3aed",  title: "Multi-Role Access",     desc: "Separate dashboards for NGOs and volunteers ensure each role sees exactly what they need." },
    { icon: Star,        color: "#b45309",  title: "Trust Scoring",         desc: "A points-based reputation system surfaces your most reliable, high-impact responders first." },
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden flex flex-col"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc" }}
    >
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-7 pb-2 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg">
            {logoAsset && <Image src={logoAsset.imageUrl} alt="Logo" width={40} height={40} className="object-cover" data-ai-hint={logoAsset.imageHint} />}
          </div>
          <span className="text-base font-black tracking-tight hidden sm:block" style={{ color: "#34535E" }}>ResQMate</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-slate-500">
          <a href="#features" className="px-3 py-2 rounded-lg hover:text-slate-800 hover:bg-white/80 transition-all">Features</a>
          <Link href="/how-it-works" className="px-3 py-2 rounded-lg hover:text-slate-800 hover:bg-white/80 transition-all">How it works</Link>
          <Link href="/stories" className="px-3 py-2 rounded-lg hover:text-slate-800 hover:bg-white/80 transition-all">Stories</Link>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 sm:px-4 py-2 rounded-lg hover:bg-white/80">Sign In</Link>
          <Link href="/login?mode=register" className="text-sm font-bold text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-200" style={{ background: "linear-gradient(135deg, #2B7B7B, #34535E)" }}>Get Started</Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#2B7B7B] via-[#34535E] to-[#1e3a42] p-10 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25">
                <span className="h-2 w-2 rounded-full animate-pulse bg-white/80" />
                <span className="text-xs font-bold uppercase text-white/90">System Online · 340 NGOs Active</span>
              </motion.div>
              <h1 className="text-4xl md:text-[3.2rem] font-black leading-[1.08] text-white tracking-tight">Coordinate<br /><span style={{ color: "#a8e6e0" }}>The Future.</span></h1>
              <p className="text-base text-white/75 font-medium max-w-md">A high-performance orchestration layer connecting NGOs, volunteers, and emergency infrastructure — natively, in real time.</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login?mode=register">
                  <button className="h-[52px] px-8 rounded-xl bg-white text-[#34535E] font-black text-sm flex items-center gap-2 hover:scale-[1.04] transition-all">Deploy Profile <ArrowRight size={16} /></button>
                </Link>
                <Link href="/login">
                  <button className="h-[52px] px-8 rounded-xl bg-white/10 border border-white/30 text-white font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition-all">Sign In</button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <HeroIllustration />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <span className="text-2xl font-black block" style={{ color: s.color }}>{s.value !== null ? <AnimCounter to={s.value} suffix={s.suffix} /> : s.display}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16 space-y-20">
        <Reveal className="text-center space-y-4">
          <span className="text-xs font-black uppercase text-[#57A498] tracking-widest">Platform Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Everything you need to respond faster.</h2>
        </Reveal>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 0.1} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-6" style={{ background: `${f.color}12` }}>
                <f.icon size={24} style={{ color: f.color }} />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg overflow-hidden shadow">
              {logoAsset && <Image src={logoAsset.imageUrl} alt="Logo" width={32} height={32} className="object-cover" data-ai-hint={logoAsset.imageHint} />}
            </div>
            <span className="font-black text-slate-900 tracking-tight">ResQMate</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} ResQMate. Empowering emergency response worldwide.</p>
          <div className="flex gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Link href="/admin/login" className="hover:text-primary transition-colors flex items-center gap-2"><Lock className="h-3 w-3" /> Admin Gateway</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
