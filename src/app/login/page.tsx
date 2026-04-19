
"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Shield, Upload, Check, Loader2, ArrowLeft, AlertCircle, KeyRound, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { sendPasswordResetOTP } from "@/app/admin/login/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const logoAsset = PlaceHolderImages.find(img => img.id === 'main-logo');
const bgAsset = PlaceHolderImages.find(img => img.id === 'login-bg');

const Pupil = ({ size = 12, maxDistance = 5, pupilColor = "black", forceLookX, forceLookY, mousePos }: any) => {
  const pupilRef = useRef<HTMLDivElement>(null);

  const calculatePupilPosition = useCallback(() => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    
    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;
    const deltaX = mousePos.x - pupilCenterX;
    const deltaY = mousePos.y - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  }, [mousePos, maxDistance, forceLookX, forceLookY]);

  const pb = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`, height: `${size}px`, backgroundColor: pupilColor,
        transform: `translate(${pb.x}px, ${pb.y}px)`, transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "white", pupilColor = "black", isBlinking = false, forceLookX, forceLookY, mousePos }: any) => {
  const eyeRef = useRef<HTMLDivElement>(null);

  const calc = useCallback(() => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    
    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;
    const deltaX = mousePos.x - eyeCenterX;
    const deltaY = mousePos.y - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  }, [mousePos, maxDistance, forceLookX, forceLookY]);

  const pop = calc();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{ width: `${size}px`, height: isBlinking ? '2px' : `${size}px`, backgroundColor: eyeColor, overflow: 'hidden' }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`, height: `${pupilSize}px`, backgroundColor: pupilColor,
            transform: `translate(${pop.x}px, ${pop.y}px)`, transition: 'transform 0.1s ease-out'
          }}
        />
      )}
    </div>
  );
};

function RoleToggle({ role, setRole }: { role: string, setRole: (r: string) => void }) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-lg gap-1 mb-2">
      {["volunteer", "ngo"].map(r => (
        <button key={r} type="button" onClick={() => setRole(r)}
          className={cn(
            "flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200",
             role === r ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )}>
          {r === "ngo" ? "NGO Admin" : "Volunteer"}
        </button>
      ))}
    </div>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [role, setRole] = useState("volunteer");
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", proofUploaded: false, proofImage: ""
  });

  // Forgot Password States
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'success'>('email');
  const [resetOtp, setResetOtp] = useState("");
  const [generatedResetOtp, setGeneratedResetOtp] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => { setMousePos({ x: e.clientX, y: e.clientY }); };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const blinkers = [
      setInterval(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => setIsPurpleBlinking(false), 150);
      }, 4000 + Math.random() * 2000),
      setInterval(() => {
        setIsBlackBlinking(true);
        setTimeout(() => setIsBlackBlinking(false), 150);
      }, 3500 + Math.random() * 3000)
    ];
    return () => blinkers.forEach(clearInterval);
  }, [isClient]);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(timer);
    } else setIsLookingAtEachOther(false);
  }, [isTyping]);

  useEffect(() => {
    const pwdLen = formData.password.length;
    if (pwdLen > 0 && showPassword) {
      const interval = setInterval(() => {
        setIsPurplePeeking(true);
        setTimeout(() => setIsPurplePeeking(false), 800);
      }, 3000 + Math.random() * 2000);
      return () => interval && clearInterval(interval);
    } else setIsPurplePeeking(false);
  }, [formData.password, showPassword]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mousePos.x - centerX;
    const deltaY = mousePos.y - centerY;
    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 25)),
      faceY: Math.max(-10, Math.min(10, deltaY / 35)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 140))
    };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        let userDoc = await getDoc(doc(db, 'users', uid));
        let userData = userDoc.data();

        if (!userData) {
          const regDoc = await getDoc(doc(db, 'registrations', uid));
          if (regDoc.exists()) { setIsPending(true); return; }
          await signOut(auth);
          setAuthError("Identity not found in command registry.");
          return;
        }

        router.push(userData.role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const registrationData: any = {
          uid: userCredential.user.uid,
          email,
          role,
          proofUploaded: formData.proofUploaded,
          proofImage: formData.proofImage || "",
          submittedAt: new Date().toISOString(),
          lastName: ""
        };

        if (role === 'ngo') {
          registrationData.organizationName = formData.name || "";
        } else {
          registrationData.firstName = formData.name || "";
        }

        await setDoc(doc(db, 'registrations', userCredential.user.uid), registrationData);
        await signOut(auth);
        setIsPending(true);
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!resetEmail) return;
    setResetLoading(true);
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedResetOtp(mockOtp);
    
    try {
      await sendPasswordResetOTP(resetEmail, mockOtp);
      setResetStep('otp');
      toast({ title: "Code Sent", description: "Check your email for the reset code." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Delivery Failed", description: error.message });
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (resetOtp === generatedResetOtp) {
      setResetStep('success');
      try {
        await sendPasswordResetEmail(auth, resetEmail);
        toast({ title: "Authorized", description: "Identity verified. Security link dispatched." });
      } catch (e) {
      }
    } else {
      toast({ variant: "destructive", title: "Invalid Code", description: "The code entered is incorrect." });
    }
  };

  const pPos = calculatePosition(purpleRef);
  const bPos = calculatePosition(blackRef);
  const yPos = calculatePosition(yellowRef);
  const oPos = calculatePosition(orangeRef);
  const pwdLen = formData.password.length;

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center hero-gradient">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
          <div className="size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8"><Shield className="size-10 text-primary" /></div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Mission Pending</h1>
          <p className="text-slate-500 font-bold leading-relaxed mb-10 text-lg">Your profile has been submitted for validation. You will be notified once operational access is granted.</p>
          <Button size="lg" className="w-full h-16 rounded-2xl text-xl font-black" onClick={() => { setIsPending(false); setIsLogin(true); }}>Gateway Home</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white overflow-hidden relative">
      <Link href="/" className="absolute top-8 left-8 lg:left-auto lg:right-8 z-50">
        <Button variant="outline" className="rounded-2xl border-2 font-black gap-2 bg-white/80 backdrop-blur-sm shadow-xl"><ArrowLeft className="h-4 w-4" /> Exit Terminal</Button>
      </Link>

      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-blue-600">
        {bgAsset && <Image src={bgAsset.imageUrl} alt="Mission Control" fill className="object-cover opacity-60 mix-blend-overlay" priority />}
        <Link href="/" className="relative z-20 flex items-center gap-4 group">
          <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            {logoAsset && <Image src={logoAsset.imageUrl} alt="Logo" width={40} height={40} className="object-cover" />}
          </div>
          <span className="font-black text-2xl tracking-tighter text-white">ResQMate</span>
        </Link>

        {isClient && (
          <div className="relative z-20 flex items-end justify-center h-[500px] mt-10">
            <div className="relative" style={{ width: '550px', height: '400px' }}>
              <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{ left: '70px', width: '180px', backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1, height: (isTyping || (pwdLen > 0 && !showPassword)) ? '440px' : '400px', transformOrigin: 'bottom center', transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)` : (isTyping || (pwdLen > 0 && !showPassword)) ? `skewX(${(pPos.bodySkew || 0) - 12}deg) translateX(40px)` : `skewX(${pPos.bodySkew || 0}deg)` }}>
                <div className="absolute flex gap-8 transition-all duration-700 ease-in-out" style={{ left: (pwdLen > 0 && showPassword) ? `20px` : isLookingAtEachOther ? `55px` : `${45 + pPos.faceX}px`, top: (pwdLen > 0 && showPassword) ? `35px` : isLookingAtEachOther ? `65px` : `${40 + pPos.faceY}px` }}>
                  <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={isPurpleBlinking} mousePos={mousePos} forceLookX={(pwdLen > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} />
                  <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={isPurpleBlinking} mousePos={mousePos} forceLookX={(pwdLen > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} />
                </div>
              </div>
              <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{ left: '240px', width: '120px', height: '310px', backgroundColor: '#2D2D2D', borderRadius: '8px 8px 0 0', zIndex: 2, transformOrigin: 'bottom center', transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)` : isLookingAtEachOther ? `skewX(${(bPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)` : `skewX(${bPos.bodySkew || 0}deg)` }}>
                <div className="absolute flex gap-6 transition-all duration-700 ease-in-out" style={{ left: (pwdLen > 0 && showPassword) ? `10px` : isLookingAtEachOther ? `32px` : `${26 + bPos.faceX}px`, top: (pwdLen > 0 && showPassword) ? `28px` : isLookingAtEachOther ? `12px` : `${32 + bPos.faceY}px` }}>
                  <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#2D2D2D" isBlinking={isBlackBlinking} mousePos={mousePos} forceLookX={(pwdLen > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} />
                  <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#2D2D2D" isBlinking={isBlackBlinking} mousePos={mousePos} forceLookX={(pwdLen > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} />
                </div>
              </div>
              <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{ left: '0px', width: '240px', height: '200px', backgroundColor: '#FF9B6B', borderRadius: '120px 120px 0 0', zIndex: 3, transformOrigin: 'bottom center', transform: `skewX(${oPos.bodySkew || 0}deg)` }}>
                <div className="absolute flex gap-8 transition-all duration-200" style={{ left: (pwdLen > 0 && showPassword) ? `50px` : `${82 + oPos.faceX}px`, top: (pwdLen > 0 && showPassword) ? `85px` : `${90 + oPos.faceY}px` }}>
                  <Pupil size={12} mousePos={mousePos} forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} />
                  <Pupil size={12} mousePos={mousePos} forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} />
                </div>
              </div>
              <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{ left: '310px', width: '140px', height: '230px', backgroundColor: '#E8D754', borderRadius: '70px 70px 0 0', zIndex: 4, transformOrigin: 'bottom center', transform: `skewX(${yPos.bodySkew || 0}deg)` }}>
                <div className="absolute flex gap-6 transition-all duration-200" style={{ left: (pwdLen > 0 && showPassword) ? `20px` : `${52 + yPos.faceX}px`, top: (pwdLen > 0 && showPassword) ? `35px` : `${40 + yPos.faceY}px` }}>
                  <Pupil size={12} mousePos={mousePos} forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} />
                  <Pupil size={12} mousePos={mousePos} forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="text-white/60 text-[10px] font-black uppercase tracking-widest flex justify-between items-center w-full relative z-20">
          <span>Global Network Operational</span>
          <span>© ResQMate v4.2</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-50 ring-4 ring-primary/10">
                {logoAsset && <Image src={logoAsset.imageUrl} alt="ResQMate" width={56} height={56} className="object-cover" />}
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tighter mb-2">{isLogin ? "Secure Link" : "Join Network"}</h1>
            <p className="text-slate-500 font-bold text-sm">{isLogin ? "Authorized Personnel Only" : "Registering new operational node"}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5 lg:space-y-6">
            <RoleToggle role={role} setRole={setRole} />
            <AnimatePresence mode="wait">
              {authError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div><p className="text-xs font-black text-rose-600 uppercase tracking-wider mb-1">Operational Alert</p><p className="text-sm font-bold text-rose-900 leading-tight">{authError}</p></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Legal Name</Label>
                <Input id="name" placeholder={role === 'ngo' ? "Official Organization Name" : "Full Responder Name"} className="h-14 rounded-2xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Network Identifier</Label>
              <Input id="email" type="email" placeholder="email@resqmate.network" className="h-14 rounded-2xl font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Security Key</Label>
                {isLogin && (
                  <button type="button" onClick={() => { setResetStep('email'); setIsResetOpen(true); }} className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline">Forgot Key?</button>
                )}
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-14 rounded-2xl font-bold pr-12" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </div>
            {!isLogin && (
              <Button type="button" variant="outline" className={cn("w-full h-14 rounded-2xl border-2 font-black transition-all", formData.proofUploaded ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "text-slate-400")} onClick={() => fileInputRef.current?.click()}>
                {formData.proofUploaded ? <><Check className="mr-2 h-5 w-5" /> Document Loaded</> : "Load Operational Credentials"}
              </Button>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setFormData(p => ({...p, proofUploaded: true, proofImage: reader.result as string}));
                reader.readAsDataURL(file);
              }
            }} />
            <Button type="submit" className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : isLogin ? "Enter Terminal" : "Deploy Node"}
            </Button>
          </form>
          <div className="text-center mt-12">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
              {isLogin ? "Deploy New Identity" : "Access Terminal"}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="p-10 bg-slate-900 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-500 rounded-xl">
                <KeyRound className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black">Key Recovery</DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 font-medium">Verify your email to continue.</DialogDescription>
          </DialogHeader>

          <div className="p-10">
            {resetStep === 'email' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Network Identifier</Label>
                  <Input 
                    id="reset-email" 
                    type="email" 
                    placeholder="email@resqmate.network" 
                    className="h-14 rounded-2xl font-bold"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <Button className="w-full h-14 rounded-2xl font-black" onClick={handleSendResetEmail} disabled={resetLoading}>
                  {resetLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Mail className="h-5 w-5 mr-2" />}
                  Dispatch Recovery Code
                </Button>
              </div>
            )}

            {resetStep === 'otp' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-otp" className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Verification Code</Label>
                  <Input 
                    id="reset-otp" 
                    type="text" 
                    placeholder="6-digit code" 
                    maxLength={6}
                    className="h-14 rounded-2xl font-bold text-center text-xl tracking-[0.5em] font-mono"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                  />
                </div>
                <Button className="w-full h-14 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700" onClick={handleVerifyResetOtp}>
                  Verify & Proceed
                </Button>
                <button onClick={() => setResetStep('email')} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600">Change Email Address</button>
              </div>
            )}

            {resetStep === 'success' && (
              <div className="space-y-8 text-center">
                <div className="mx-auto h-20 w-20 rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <Check className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Handshake Complete</h3>
                  <p className="text-sm text-slate-500 font-medium">A security link has been sent to your primary terminal. Follow the instructions to set a new key.</p>
                </div>
                <Button className="w-full h-14 rounded-2xl font-black" onClick={() => setIsResetOpen(false)}>Return to Terminal</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AuthPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}><AuthContent /></Suspense>;
}
