
"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Shield, Globe, CheckCircle,
  Activity, MapPin, Users, Clock, ChevronRight,
  Heart, Star, Bell, TrendingUp, Zap, Check,
} from "lucide-react";

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
    return () => clearInterval(timer);
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] flex items-center justify-center rounded-[1.5rem] bg-white/20 border-2 border-white/45 backdrop-blur-md animate-float">
        <span className="text-white font-black text-3xl tracking-tighter">R</span>
      </div>

      {/* Orbiting nodes */}
      {nodes.map(({ label, Icon, angle, r, color }, i) => {
        const rad = (angle * Math.PI) / 180;
        // Rounding to avoid hydration mismatch on long floating point strings
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
              left: x, top: y,
              background: isBright ? "rgba(255,255,255,0.92)" : "rgba(52,83,94,0.85)",
              border: `1px solid ${isBright ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)"}`,
            }}
          >
            <Icon size={13} style={{ color: isBright ? "#2B7B7B" : "#ffffff" }} strokeWidth={2.5} />
            <span className="text-[9px] font-bold whitespace-nowrap" style={{ color: isBright ? "#34535E" : "#e2f0ef" }}>{label}</span>
          </motion.div>
        );
      })}

      {/* Floating stat chips */}
      <motion.div
        animate={{ y: [-5, 5] }}
        transition={{ repeat: Infinity, duration: 3.5, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute -top-3 right-0 rounded-2xl px-4 py-2.5 bg-white/15 border border-white/30 backdrop-blur-md"
      >
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">Active Volunteers</p>
        <p className="text-lg font-black text-white">1,248</p>
      </motion.div>

      <motion.div
        animate={{ y: [5, -5] }}
        transition={{ repeat: Infinity, duration: 4.2, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute bottom-0 -left-6 rounded-2xl px-4 py-2.5 bg-white/15 border border-white/30 backdrop-blur-md"
      >
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">Missions Done</p>
        <p className="text-lg font-black text-white">9,340</p>
      </motion.div>
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

  const featureList = [
    { icon: Globe,       color: "#2B7B7B", title: "GPS-based volunteer matching", desc: "Demand connecting volunteers with emergencies in real time" },
    { icon: Shield,      color: "#34535E", title: "Easy QR verification",         desc: "A few clicks closes the first verification handoff" },
    { icon: Activity,    color: "#57A498", title: "Financial & Operations",        desc: "Full audit trail of assignment, payments and reports" },
    { icon: MapPin,      color: "#CF223B", title: "Filter by specialty & region",  desc: "Find the right volunteer based on your area and specialization" },
  ];

  const steps = [
    { step: "01", icon: Zap,          color: "#2B7B7B", title: "NGO Deploys a Task",   desc: "Organizations post needs with location, skills required, and urgency level in under a minute." },
    { step: "02", icon: MapPin,       color: "#34535E", title: "Volunteers Are Matched", desc: "Our GPS engine instantly identifies and notifies the nearest certified volunteers." },
    { step: "03", icon: CheckCircle,  color: "#57A498", title: "Mission Verified",       desc: "QR handoff confirms task completion. Points are awarded. Impact is logged permanently." },
  ];

  const testimonials = [
    { quote: "ResQMate cut our coordination time from 20 minutes to under 3. It's the operating system for crisis response.", name: "Lead Coordinator",  role: "Medical Lead, HelpFirst NGO",    initials: "LC", color: "#2B7B7B" },
    { quote: "The QR verification system gave our donors real-time proof that volunteers actually showed up. Trust = funding.", name: "Logistics Expert",   role: "Logistics Director, ReliefNet",  initials: "LE", color: "#34535E" },
    { quote: "As a volunteer, I can find and accept tasks in 60 seconds flat. The GPS navigation is genuinely life-saving.",   name: "Field Responder",   role: "Field Paramedic, 240+ missions", initials: "FR", color: "#57A498" },
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden flex flex-col"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc" }}
    >
      {/* ── Very subtle page background blobs ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(87,164,152,0.15) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(52,83,94,0.12) 0%, transparent 70%)" }} />
      </div>

      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-7 pb-2 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
            style={{ background: "linear-gradient(135deg, #34535E, #2B7B7B)" }}
          >R</div>
          <span className="text-base font-black tracking-tight hidden sm:block" style={{ color: "#34535E" }}>ResQMate</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-slate-500">
          <a href="#features"     className="px-3 py-2 rounded-lg hover:text-slate-800 hover:bg-white/80 transition-all">Features</a>
          <a href="#how-it-works" className="px-3 py-2 rounded-lg hover:text-slate-800 hover:bg-white/80 transition-all">How it works</a>
          <a href="#testimonials" className="px-3 py-2 rounded-lg hover:text-slate-800 hover:bg-white/80 transition-all">Stories</a>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/login"
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 sm:px-4 py-2 rounded-lg hover:bg-white/80"
          >Sign In</Link>
          <Link href="/register"
            className="text-sm font-bold text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-200 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2B7B7B, #34535E)" }}
          >Get Started</Link>
        </div>
      </motion.nav>

      {/* ════════════════════════════════════════
          HERO — rounded card with gradient bg
      ════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative rounded-[2.5rem] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2B7B7B 0%, #34535E 55%, #1e3a42 100%)" }}
        >
          {/* Hero background shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)" }} />
            <div className="absolute -bottom-16 left-1/4 w-56 h-56 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, rgba(87,164,152,0.6), transparent 70%)" }} />
            <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full opacity-5"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,1), transparent 70%)", transform: "translateY(-50%)" }} />
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-8 lg:gap-12 items-center px-10 py-14 md:py-16">
            {/* Left: Copy */}
            <div className="flex flex-col gap-6">
              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-flex w-max items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25"
              >
                <span className="h-2 w-2 rounded-full animate-pulse bg-white/80" />
                <span className="text-xs font-bold tracking-widest uppercase text-white/90">
                  System Online · 340 NGOs Active
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.55 }}
                className="text-4xl md:text-[3.2rem] font-black leading-[1.08] text-white tracking-tight"
              >
                Coordinate<br />
                <span style={{ color: "#a8e6e0" }}>The Future.</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.33, duration: 0.5 }}
                className="text-base text-white/75 leading-relaxed max-w-md font-medium"
              >
                A high-performance orchestration layer connecting NGOs, volunteers,
                and emergency infrastructure — natively, in real time.
              </motion.p>

              {/* Feature list */}
              <motion.ul
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.45 }}
                className="flex flex-col gap-2.5"
              >
                {[
                  "GPS-based volunteer matching in seconds",
                  "QR-verified task handoffs for trust",
                  "Real-time emergency alerts & response",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm font-semibold text-white/90">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </motion.ul>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.45 }}
                className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1"
              >
                <Link href="/register" className="w-full sm:w-auto">
                  <button
                    className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-7 rounded-xl text-sm font-bold shadow-lg hover:scale-[1.04] hover:shadow-xl active:scale-[0.98] transition-all duration-200 h-[50px] bg-white text-[#34535E]"
                  >
                    Deploy Profile <ArrowRight size={15} />
                  </button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <button
                    className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-7 rounded-xl text-sm font-bold hover:scale-[1.02] transition-all duration-200 h-[50px] bg-white/10 border-[1.5px] border-white/30 text-white"
                  >
                    Sign In <ChevronRight size={15} className="opacity-70" />
                  </button>
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.45 }}
                className="flex items-center gap-3 pt-2 border-t border-white/15"
              >
                <div className="flex -space-x-2.5 pt-3">
                  {["#2B7B7B", "#34535E", "#57A498", "#64748b", "#16a34a"].map((c, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-white text-[10px] font-black"
                      style={{ background: c, borderColor: "rgba(255,255,255,0.4)" }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/70 font-medium pt-3">
                  <span className="font-bold text-white">1,200+ volunteers</span> already on the network
                </p>
              </motion.div>
            </div>

            {/* Right: Animated Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay: 0.12 }}
              className="hidden md:flex items-center justify-center py-8"
            >
              <HeroIllustration />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          STATS BAR — white card under hero
      ════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 sm:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}12` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <span className="text-2xl font-black block" style={{ color: s.color }}>
                  {s.value !== null
                    ? <AnimCounter to={s.value} suffix={s.suffix} />
                    : s.display}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — Alternating: Image Left + Feature List Right
      ════════════════════════════════════════ */}
      <section id="features" className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0 items-stretch">
            <Reveal direction="left" className="h-full">
              <div className="h-full flex items-center justify-center p-10 md:p-12 bg-gradient-to-br from-[#f0f7f6] to-[#e8f4f3]">
                <div className="relative w-full max-w-sm">
                  <div className="absolute -inset-8 rounded-full opacity-40 bg-radial-gradient(circle, rgba(43,123,123,0.12), transparent 70%)" />
                  <div className="relative bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow bg-gradient-to-br from-[#34535E] to-[#2B7B7B]">R</div>
                      <div>
                        <p className="text-xs font-black text-slate-700">ResQMate Dashboard</p>
                        <p className="text-[10px] text-slate-400 font-medium">Emergency Coordination</p>
                      </div>
                    </div>
                    {[
                      { label: "Active Missions",    val: "12",    color: "#2B7B7B" },
                      { label: "Volunteers Online",  val: "248",   color: "#57A498" },
                      { label: "Avg Response Time",  val: "3.8m",  color: "#34535E" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: row.color }} />
                          <span className="text-xs font-semibold text-slate-600">{row.label}</span>
                        </div>
                        <span className="text-sm font-black" style={{ color: row.color }}>{row.val}</span>
                      </div>
                    ))}
                    <div className="mt-5 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#57A498] to-[#2B7B7B]" style={{ width: "73%" }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1.5">73% capacity utilised</p>
                  </div>
                  <motion.div animate={{ y: [-4, 4] }} transition={{ repeat: Infinity, duration: 3, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute -bottom-5 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Network Trust</p>
                    <p className="text-lg font-black text-[#2B7B7B]">High ✓</p>
                  </motion.div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" className="h-full">
              <div className="p-10 md:p-12 flex flex-col justify-center gap-7">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#57A498]">What We Do</span>
                  <h2 className="mt-2 text-2xl md:text-3xl font-black leading-tight text-[#1e293b]">
                    Built for real emergencies.{" "}
                    <span className="text-[#2B7B7B]">Designed for real speed.</span>
                  </h2>
                  <p className="mt-3 text-sm text-slate-500 font-medium leading-relaxed">
                    Every feature is engineered to reduce friction during critical moments.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  {features.map((f, i) => (
                    <Reveal key={i} delay={i * 0.08}>
                      <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60
                              hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all duration-250 cursor-default group">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"
                          style={{ background: `${f.color}12` }}>
                          <f.icon size={18} style={{ color: f.color }} strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{f.title}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3 — Alternating: Content Left + Network Visual Right
      ════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0 items-stretch">
            <Reveal direction="left" className="h-full">
              <div className="p-10 md:p-12 flex flex-col justify-center gap-7">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#57A498]">Our Commitment</span>
                  <h2 className="mt-2 text-2xl md:text-3xl font-black leading-tight text-[#1e293b]">
                    We are active{" "}
                    <span className="text-[#2B7B7B]">across all emergencies...</span>
                  </h2>
                  <p className="mt-3 text-sm text-slate-500 font-medium leading-relaxed">
                    ResQMate bridges the gap between those in urgent need and the dedicated professionals equipped to help.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { n: "1", text: "The primary platform connecting NGOs with verified volunteers for emergencies across regions.", color: "#2B7B7B" },
                    { n: "2", text: "A specialized network built to surface new volunteer opportunities in real time.", color: "#34535E" },
                    { n: "3", text: "Premium support and personalized coordination for all participating members.", color: "#57A498" },
                  ].map((item, i) => (
                    <Reveal key={i} delay={i * 0.1}>
                      <div className="flex items-start gap-4 group">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-sm shadow-md group-hover:scale-110 transition-transform"
                          style={{ background: item.color }}>
                          {item.n}
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed pt-1.5">{item.text}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  {["Verified Teams", "Real-time Operations", "Secure Verification"].map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#f0f7f6] text-[#2B7B7B]">
                      <Check size={11} strokeWidth={3} className="text-[#57A498]" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" className="h-full">
              <div className="h-full flex items-center justify-center p-10 md:p-12 relative bg-gradient-to-br from-[#eef4f3] to-[#f0f7f6]">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-30 bg-radial-gradient(circle, rgba(43,123,123,0.25), transparent 70%)" />
                </div>
                <div className="relative z-10 w-full max-w-[300px]">
                  <div className="mx-auto mb-6 h-20 w-20 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl animate-float bg-gradient-to-br from-[#34535E] to-[#2B7B7B]">R</div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      ["#2B7B7B","A"],["#34535E","B"],["#57A498","C"],["#16a34a","D"],
                      ["#64748b","E"],["#2B7B7B","F"],["#34535E","G"],["#57A498","H"],
                    ].map(([c, l], i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 220, damping: 18 }}
                        className="h-14 w-14 rounded-2xl flex flex-col items-center justify-center text-white font-black text-sm shadow-md border-2 border-white hover:-translate-y-1 transition-transform cursor-default"
                        style={{ background: c }}
                      >
                        {l}
                        <span className="text-[8px] font-semibold opacity-75 mt-0.5">Vol.</span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div animate={{ y: [-4, 4] }} transition={{ repeat: Infinity, duration: 3.8, repeatType: "reverse", ease: "easeInOut" }}
                    className="mt-5 mx-auto w-max bg-white rounded-2xl px-5 py-3 shadow-xl border border-slate-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                      <Activity size={14} className="text-[#16a34a]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Always Active</p>
                      <p className="text-sm font-black text-[#2B7B7B]">24/7 Coordination</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 — How It Works
      ════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4">
        <Reveal>
          <div className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#1e3a42] via-[#2B7B7B] to-[#34535E]">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 right-1/4 w-64 h-64 rounded-full opacity-10 bg-radial-gradient(circle, rgba(255,255,255,0.5), transparent)" />
            </div>
            <div className="relative z-10 px-10 py-14 md:py-16">
              <div className="text-center mb-12">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">How It Works</span>
                <h2 className="mt-3 text-2xl md:text-4xl font-black text-white leading-tight">
                  From alert to action in minutes.
                </h2>
                <p className="mt-3 text-white/60 text-sm font-medium max-w-xl mx-auto">
                  Three simple steps separate a crisis from a resolution.
                </p>
              </div>
              <div className="hidden md:block relative mb-6">
                <div className="absolute top-5 left-[16.67%] right-[16.67%] h-0.5 opacity-30 bg-gradient-to-r from-white/50 via-white/80 to-white/50" />
                <div className="grid grid-cols-3 gap-6">
                  {steps.map((_, i) => (
                    <div key={i} className="flex justify-center">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg bg-white/20 border-2 border-white/35">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {steps.map((s, i) => (
                  <Reveal key={i} delay={i * 0.12}>
                    <div className="rounded-2xl p-7 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300 bg-white/10 border border-white/20 backdrop-blur-md">
                      <div className="text-[56px] font-black leading-none text-white/12">
                        {s.step}
                      </div>
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-white/15 border border-white/25">
                        <s.icon size={20} className="text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-base font-black text-white">{s.title}</h3>
                      <p className="text-sm text-white/65 leading-relaxed font-medium">{s.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════
          FEATURE CARDS GRID
      ════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10">
        <Reveal className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#57A498]">Platform Capabilities</span>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-[#1e293b]">
            Everything you need to respond faster.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div className="group bg-white border border-slate-100 rounded-2xl p-7 flex flex-col gap-4 h-full
                  hover:shadow-[0_10px_40px_rgba(43,123,123,0.1)] hover:-translate-y-1.5 transition-all duration-300 cursor-default">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${f.color}12` }}>
                  <f.icon size={20} style={{ color: f.color }} strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-slate-800">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <section id="testimonials" className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 pb-8">
        <Reveal className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#57A498]">Field Stories</span>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-[#1e293b]">
            Trusted by those on the ground.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm
                  hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5 h-full">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={13} fill="#f59e0b" className="text-[#f59e0b]" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1 font-medium italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black text-sm"
                    style={{ background: t.color }}>{t.initials}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <Reveal>
          <div className="rounded-[2rem] px-10 py-14 md:py-16 text-center relative overflow-hidden shadow-2xl bg-gradient-to-br from-[#1e3a42] via-[#2B7B7B] to-[#34535E]">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-15 animate-float-slow bg-radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10 animate-float bg-radial-gradient(circle, rgba(87,164,152,0.7), transparent 70%)" />
            <div className="relative z-10">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Ready to Deploy?</span>
              <h2 className="mt-3 text-2xl md:text-4xl font-black text-white leading-tight mb-5">
                Join the network saving<br />lives in real time.
              </h2>
              <p className="text-white/65 text-sm font-medium mb-10 max-w-lg mx-auto">
                Whether you're an NGO coordinating missions or a volunteer ready to help —
                ResQMate is the platform for you.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register">
                  <button className="inline-flex items-center gap-2 px-8 rounded-xl bg-white text-slate-900 font-black text-sm hover:scale-[1.04] hover:shadow-2xl active:scale-[0.98] transition-all duration-200 h-[52px]">
                    Deploy My Profile <ArrowRight size={16} />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="inline-flex items-center gap-2 px-8 rounded-xl text-white font-bold text-sm hover:bg-white/10 hover:scale-[1.02] transition-all duration-200 h-[52px] border-[1.5px] border-white/25">
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="relative z-10 w-full border-t border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-black text-xs shadow bg-gradient-to-br from-[#34535E] to-[#2B7B7B]">R</div>
            <span className="text-sm font-black text-slate-600">ResQMate</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} ResQMate. Empowering emergency response worldwide.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-slate-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-600 transition-colors">How it works</a>
            <Link href="/login" className="hover:text-slate-600 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
