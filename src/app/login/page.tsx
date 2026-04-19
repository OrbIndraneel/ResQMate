
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Shield, Upload, Check, Mail, Sparkles, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const logoAsset = PlaceHolderImages.find(img => img.id === 'main-logo');

// Animated Pupil Component
const Pupil = ({ size = 12, maxDistance = 5, pupilColor = "black", forceLookX, forceLookY }: any) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
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
  };

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

// Animated EyeBall Component
const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "white", pupilColor = "black", isBlinking = false, forceLookX, forceLookY }: any) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calc = () => {
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
  };

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

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", proofUploaded: false, proofImage: ""
  });

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
    const handleMouseMove = (e: MouseEvent) => { setMousePos({ x: e.clientX, y: e.clientY }); };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => { setIsPurpleBlinking(false); scheduleBlink(); }, 150);
      }, Math.random() * 4000 + 3000);
      return blinkTimeout;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => { setIsBlackBlinking(false); scheduleBlink(); }, 150);
      }, Math.random() * 4000 + 3000);
      return blinkTimeout;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

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
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => setIsPurplePeeking(false), 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };
      const fp = schedulePeek();
      return () => clearTimeout(fp);
    } else setIsPurplePeeking(false);
  }, [formData.password, showPassword]);

  const toggleMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setAuthError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, proofUploaded: true, proofImage: reader.result as string }));
        toast({ title: "Document Loaded", description: "Operational credentials have been staged for verification." });
      };
      reader.readAsDataURL(file);
    }
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
          setAuthError("Operational Alert: This identity is not found in the command registry. Please deploy a new node if you are a first-time responder.");
          return;
        }

        if (userData.role !== role) {
          setAuthError(`Role mismatch. This account is registered as a ${userData.role}.`);
          return;
        }

        router.push(role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard');
      } else {
        if (role === 'ngo' && !formData.proofUploaded) {
          setAuthError("Please upload organization documentation before deploying profile.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const registrationData: any = {
          uid: userCredential.user.uid,
          email,
          role,
          proofUploaded: formData.proofUploaded,
          proofImage: formData.proofImage || "",
          submittedAt: new Date().toISOString(),
          organizationName: role === 'ngo' ? (formData.name || "") : undefined,
          firstName: role === 'volunteer' ? (formData.name || "") : undefined,
          lastName: ""
        };

        await setDoc(doc(db, 'registrations', userCredential.user.uid), registrationData);
        setIsPending(true);
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePosition = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mousePos.x - centerX;
    const deltaY = mousePos.y - centerY;
    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120))
    };
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
          <p className="text-slate-500 font-bold leading-relaxed mb-10 text-lg">Profile submitted. Command is verifying your credentials. You will receive an operational link once access is granted.</p>
          <Button size="lg" className="w-full h-16 rounded-2xl text-xl font-black" onClick={() => { setIsPending(false); setIsLogin(true); }}>Back to Gateway</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white overflow-hidden relative">
      <Link href="/" className="absolute top-8 left-8 lg:left-auto lg:right-8 z-50">
        <Button variant="outline" className="rounded-2xl border-2 font-black gap-2 bg-white/80 backdrop-blur-sm shadow-xl"><ArrowLeft className="h-4 w-4" /> Back to Home</Button>
      </Link>

      <div className="relative hidden lg:flex flex-col justify-between bg-primary p-12 overflow-hidden">
        <Link href="/" className="relative z-20 flex items-center gap-4 group">
          <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg bg-white/10 backdrop-blur-sm flex items-center justify-center font-black text-white">R</div>
          <span className="font-black text-2xl tracking-tighter text-white">ResQMate</span>
        </Link>

        {/* Animated Characters Scene */}
        <div className="relative z-20 flex items-end justify-center h-[500px] mt-10">
          <div className="relative" style={{ width: '550px', height: '400px' }}>
            
            {/* Purple Character */}
            <div 
              ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px', width: '180px', backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1,
                height: (isTyping || (pwdLen > 0 && !showPassword)) ? '440px' : '400px',
                transformOrigin: 'bottom center',
                transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)` 
                         : (isTyping || (pwdLen > 0 && !showPassword)) ? `skewX(${(pPos.bodySkew || 0) - 12}deg) translateX(40px)` 
                         : `skewX(${pPos.bodySkew || 0}deg)`,
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: (pwdLen > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + pPos.faceX}px`,
                  top: (pwdLen > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + pPos.faceY}px`,
                }}
              >
                <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={isPurpleBlinking}
                  forceLookX={(pwdLen > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(pwdLen > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
                <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={isPurpleBlinking}
                  forceLookX={(pwdLen > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(pwdLen > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
              </div>
            </div>

            {/* Black Character */}
            <div 
              ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px', width: '120px', height: '310px', backgroundColor: '#2D2D2D', borderRadius: '8px 8px 0 0', zIndex: 2,
                transformOrigin: 'bottom center',
                transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)`
                         : isLookingAtEachOther ? `skewX(${(bPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                         : (isTyping || (pwdLen > 0 && !showPassword)) ? `skewX(${(bPos.bodySkew || 0) * 1.5}deg)` 
                         : `skewX(${bPos.bodySkew || 0}deg)`,
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: (pwdLen > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + bPos.faceX}px`,
                  top: (pwdLen > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + bPos.faceY}px`,
                }}
              >
                <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#2D2D2D" isBlinking={isBlackBlinking}
                  forceLookX={(pwdLen > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(pwdLen > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined} />
                <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#2D2D2D" isBlinking={isBlackBlinking}
                  forceLookX={(pwdLen > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(pwdLen > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined} />
              </div>
            </div>

            {/* Orange Character */}
            <div 
              ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px', width: '240px', height: '200px', backgroundColor: '#FF9B6B', borderRadius: '120px 120px 0 0', zIndex: 3,
                transformOrigin: 'bottom center',
                transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)` : `skewX(${oPos.bodySkew || 0}deg)`,
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: (pwdLen > 0 && showPassword) ? `${50}px` : `${82 + (oPos.faceX || 0)}px`,
                  top: (pwdLen > 0 && showPassword) ? `${85}px` : `${90 + (oPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} forceLookY={(pwdLen > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} forceLookY={(pwdLen > 0 && showPassword) ? -4 : undefined} />
              </div>
            </div>

            {/* Yellow Character */}
            <div 
              ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px', width: '140px', height: '230px', backgroundColor: '#E8D754', borderRadius: '70px 70px 0 0', zIndex: 4,
                transformOrigin: 'bottom center',
                transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yPos.bodySkew || 0}deg)`,
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: (pwdLen > 0 && showPassword) ? `${20}px` : `${52 + (yPos.faceX || 0)}px`,
                  top: (pwdLen > 0 && showPassword) ? `${35}px` : `${40 + (yPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} forceLookY={(pwdLen > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} forceLookY={(pwdLen > 0 && showPassword) ? -4 : undefined} />
              </div>
              <div 
                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left: (pwdLen > 0 && showPassword) ? `${10}px` : `${40 + (yPos.faceX || 0)}px`,
                  top: (pwdLen > 0 && showPassword) ? `${88}px` : `${88 + (yPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="text-white/60 text-[10px] font-black uppercase tracking-widest flex justify-between items-center w-full relative z-20">
          <span>Global Network Operational</span>
          <span>© ResQMate v4.2</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black tracking-tighter mb-3">{isLogin ? "Secure Link" : "Join Network"}</h1>
            <p className="text-slate-500 font-bold">{isLogin ? "Authorized Personnel Only" : "Registering new operational node"}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <RoleToggle role={role} setRole={setRole} />
            <AnimatePresence>
              {authError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-rose-600 uppercase tracking-wider mb-1">Operational Alert</p>
                      <p className="text-sm font-bold text-rose-900 leading-tight">{authError}</p>
                    </div>
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
                {isLogin && <button type="button" onClick={() => toast({ title: "Check Inbox", description: "Recovery link dispatched." })} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Recovery Link?</button>}
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-14 rounded-2xl font-bold pr-12" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button type="button" variant="outline" className={cn("w-full h-14 rounded-2xl border-2 font-black transition-all", formData.proofUploaded ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "text-slate-400")} onClick={() => fileInputRef.current?.click()}>
                  {formData.proofUploaded ? <><Check className="mr-2 h-5 w-5" /> Document Loaded</> : <><Upload className="mr-2 h-5 w-5" /> Load Operational Credentials</>}
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : isLogin ? "Enter Terminal" : "Deploy Node"}
            </Button>
          </form>

          <div className="text-center mt-12">
            <button onClick={() => toggleMode(!isLogin)} className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
              {isLogin ? "No active node? Deploy New Identity" : "Already registered? Access Terminal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
