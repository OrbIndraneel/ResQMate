
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Shield, Check, Mail, Sparkles, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EASE = [0.25, 0.46, 0.45, 0.94];

const AVAILABLE_SKILLS = [
  "First Aid", "Nursing", "Heavy Lifting", "Logistics", "Driving", 
  "Translation", "IT Support", "Cooking", "Construction", 
  "Counseling", "Security", "Search & Rescue"
];

// Animated Pupil Component
const Pupil = ({ size = 12, maxDistance = 5, pupilColor = "black", forceLookX, forceLookY }: any) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
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
    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
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
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
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
    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
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

function RoleToggle({ role, setRole }: any) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 mb-2">
      {["volunteer", "ngo"].map(r => (
        <button key={r} type="button" onClick={() => setRole(r)}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
             role === r ? "bg-white text-primary shadow-lg" : "text-slate-400 hover:text-slate-600"
          )}>
          {r === "ngo" ? "NGO Admin" : "Volunteer"}
        </button>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [role, setRole] = useState("volunteer");
  const [isPendingReview, setIsPendingReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "", adminName: "", email: "", password: "", address: "", contact: "", skills: [] as string[], proofUploaded: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  const toggleMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setStatusError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleForgotPassword = async () => {
    const email = formData.email.trim().toLowerCase();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your registered email address first so we know where to send the link.",
      });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a correctly formatted email identifier.",
      });
      return;
    }

    setRecoveryLoading(true);
    setStatusError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Recovery Signal Sent",
        description: `An official encryption reset link has been dispatched to ${email}. Please check your inbox (and spam folder).`,
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMsg = "Could not initiate recovery. Please verify the email address or try again later.";
      
      if (error.code === 'auth/user-not-found') {
        errorMsg = "No responder node found with this email. Please register for an account first.";
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = "The email identifier provided is not valid.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = "System locked due to too many attempts. Please wait a few minutes.";
      }
      
      setStatusError(errorMsg);
      toast({
        variant: "destructive",
        title: "Recovery Failed",
        description: errorMsg,
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusError(null);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email) {
      setStatusError("Email identifier is required.");
      setLoading(false);
      return;
    }

    if (!password) {
      setStatusError("Encryption key (password) is required.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role !== role) {
              throw new Error(`Account mismatch. This node is registered as a ${data.role}.`);
            }
            toast({ title: "Link Established", description: "Entering command terminal..." });
            router.push(role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard');
            return;
          }

          const regRef = doc(db, 'registrations', user.uid);
          const regDoc = await getDoc(regRef);

          if (regDoc.exists()) {
            setIsPendingReview(true);
            setLoading(false);
            return;
          }

          setStatusError("Node record not found. Contact support for vetting status.");
        } catch (error: any) {
          console.error(error);
          let errorMsg = "Authentication Failure: Access Denied.";
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            errorMsg = "Invalid email or password. Please check your credentials or use the recovery link.";
          } else if (error.code === 'auth/too-many-requests') {
            errorMsg = "System locked due to multiple failed attempts. Please try again later.";
          }
          setStatusError(errorMsg);
        }
      } else {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          const displayName = formData.name;
          await updateProfile(user, { displayName });

          const registrationData = {
            uid: user.uid,
            email: email,
            role: role,
            submittedAt: new Date().toISOString(),
            verificationStatus: 'pending',
            ...(role === 'volunteer' ? {
              firstName: formData.name.split(' ')[0],
              lastName: formData.name.split(' ').slice(1).join(' '),
              skills: formData.skills,
              location: formData.address,
              phone: formData.contact,
              affiliationType: 'independent'
            } : {
              organizationName: formData.name,
              adminName: formData.adminName,
              location: formData.address,
            })
          };

          await setDoc(doc(db, 'registrations', user.uid), registrationData);
          setIsPendingReview(true);
          toast({ title: "Signal Sent", description: "Registration submitted for admin review." });
        } catch (error: any) {
          let errorMsg = error.message;
          if (error.code === 'auth/email-already-in-use') {
            errorMsg = "This email is already in the network. Try logging in or resetting your key.";
          } else if (error.code === 'auth/weak-password') {
            errorMsg = "Encryption key too weak. Use at least 6 characters.";
          }
          setStatusError(errorMsg);
        }
      }
    } catch (error: any) {
      console.error(error);
      setStatusError(error.message || "An unexpected operational error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const i1 = setInterval(() => {
      setIsPurpleBlinking(true);
      setTimeout(() => setIsPurpleBlinking(false), 150);
    }, 4500);
    const i2 = setInterval(() => {
      setIsBlackBlinking(true);
      setTimeout(() => setIsBlackBlinking(false), 150);
    }, 3800);
    return () => { clearInterval(i1); clearInterval(i2); };
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => setIsLookingAtEachOther(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
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

  if (isPendingReview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8 hero-gradient">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md bg-white p-12 rounded-[3rem] shadow-2xl border-none text-center space-y-8">
          <div className="size-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
            <Shield className="size-12 text-primary" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Approval Pending</h1>
            <p className="text-slate-500 font-bold leading-relaxed">
              Your credentials are being verified by ResQMate Command. Access will be granted once your operational status is confirmed.
            </p>
          </div>
          <Button size="lg" className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" onClick={() => setIsPendingReview(false)}>
            Return to Link Portal
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white overflow-hidden">
      
      {/* Character Visualization Side */}
      <div className="relative hidden lg:flex flex-col justify-between bg-slate-950 p-16 overflow-hidden">
        <Link href="/" className="relative z-20 flex items-center gap-4 group">
          <div className="bg-primary p-3 rounded-2xl text-white shadow-2xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
            <Shield className="h-7 w-7" />
          </div>
          <span className="font-black text-3xl tracking-tighter text-white">ResQMate</span>
        </Link>

        <div className="relative z-20 flex items-end justify-center h-[550px] mb-12">
          <div className="relative" style={{ width: '550px', height: '400px' }}>
            
            {/* Purple Character */}
            <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px', width: '180px', backgroundColor: '#6C3FF5', borderRadius: '40px 40px 0 0', zIndex: 1,
                height: (isTyping || (pwdLen > 0 && !showPassword)) ? '440px' : '400px',
                transformOrigin: 'bottom center',
                transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)` 
                         : (isTyping || (pwdLen > 0 && !showPassword)) ? `skewX(${(pPos.bodySkew || 0) - 12}deg) translateX(40px)` 
                         : `skewX(${pPos.bodySkew || 0}deg)`,
              }}>
              <div className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: (pwdLen > 0 && showPassword) ? `20px` : isLookingAtEachOther ? `55px` : `${45 + pPos.faceX}px`,
                  top: (pwdLen > 0 && showPassword) ? `35px` : isLookingAtEachOther ? `65px` : `${40 + pPos.faceY}px`,
                }}>
                <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={isPurpleBlinking}
                  forceLookX={(pwdLen > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} />
                <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={isPurpleBlinking}
                  forceLookX={(pwdLen > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} />
              </div>
            </div>

            {/* Black Character */}
            <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px', width: '120px', height: '310px', backgroundColor: '#1e293b', borderRadius: '30px 30px 0 0', zIndex: 2,
                transformOrigin: 'bottom center',
                transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)`
                         : isLookingAtEachOther ? `skewX(${(bPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                         : (isTyping || (pwdLen > 0 && !showPassword)) ? `skewX(${(bPos.bodySkew || 0) * 1.5}deg)` 
                         : `skewX(${bPos.bodySkew || 0}deg)`,
              }}>
              <div className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: (pwdLen > 0 && showPassword) ? `10px` : isLookingAtEachOther ? `32px` : `${26 + bPos.faceX}px`,
                  top: (pwdLen > 0 && showPassword) ? `28px` : isLookingAtEachOther ? `12px` : `${32 + bPos.faceY}px`,
                }}>
                <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#1e293b" isBlinking={isBlackBlinking}
                  forceLookX={(pwdLen > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} />
                <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#1e293b" isBlinking={isBlackBlinking}
                  forceLookX={(pwdLen > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} />
              </div>
            </div>

            {/* Orange Character */}
            <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px', width: '240px', height: '200px', backgroundColor: '#f97316', borderRadius: '120px 120px 0 0', zIndex: 3,
                transformOrigin: 'bottom center',
                transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)` : `skewX(${oPos.bodySkew || 0}deg)`,
              }}>
              <div className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: (pwdLen > 0 && showPassword) ? `50px` : `${82 + (oPos.faceX || 0)}px`,
                  top: (pwdLen > 0 && showPassword) ? `85px` : `${90 + (oPos.faceY || 0)}px`,
                }}>
                <Pupil size={12} maxDistance={5} pupilColor="#1e293b" forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#1e293b" forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} />
              </div>
            </div>

            {/* Yellow Character */}
            <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px', width: '140px', height: '230px', backgroundColor: '#fbbf24', borderRadius: '70px 70px 0 0', zIndex: 4,
                transformOrigin: 'bottom center',
                transform: (pwdLen > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yPos.bodySkew || 0}deg)`,
              }}>
              <div className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: (pwdLen > 0 && showPassword) ? `20px` : `${52 + (yPos.faceX || 0)}px`,
                  top: (pwdLen > 0 && showPassword) ? `35px` : `${40 + (yPos.faceY || 0)}px`,
                }}>
                <Pupil size={12} maxDistance={5} pupilColor="#1e293b" forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#1e293b" forceLookX={(pwdLen > 0 && showPassword) ? -5 : undefined} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest flex justify-between items-center w-full relative z-20">
          <span>Global Network Operational</span>
          <span>© ResQMate v4.2</span>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] pointer-events-none" />
      </div>

      {/* Form Side */}
      <div className="flex flex-col items-center justify-center p-8 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "reg"}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="text-center mb-10"
            >
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{isLogin ? "Secure Link" : "Join Network"}</h1>
              <p className="text-slate-500 font-bold">{isLogin ? "Establish command terminal connection." : "Register as a verified responder node."}</p>
            </motion.div>
          </AnimatePresence>

          {statusError && (
            <Alert variant="destructive" className="mb-8 rounded-[2rem] border-2 bg-rose-50 border-rose-100">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-black">Operational Alert</AlertTitle>
              <AlertDescription className="font-medium text-sm">{statusError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <RoleToggle role={role} setRole={setRole} />

            <div className="space-y-4">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden pb-1">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{role === 'ngo' ? "Legal Entity Name" : "Responder Name"}</Label>
                      <Input name="name" placeholder={role === 'ngo' ? "World Food Programme" : "John Doe"} required className="h-14 rounded-2xl border-slate-200 font-bold" onChange={handleChange} />
                    </div>
                    {role === 'volunteer' && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Base Operations Location</Label>
                        <Input name="address" placeholder="London, UK" required className="h-14 rounded-2xl border-slate-200 font-bold" onChange={handleChange} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Secure Identifier (Email)</Label>
                <Input
                  type="email" name="email" placeholder="node@ops.network"
                  value={formData.email}
                  onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)}
                  className="h-14 rounded-2xl border-slate-200 font-bold" onChange={handleChange} required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Encryption Key (Password)</Label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      disabled={recoveryLoading}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline disabled:opacity-50"
                    >
                      {recoveryLoading ? "Syncing..." : "Recovery Link?"}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"} name="password" placeholder="••••••••"
                    onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)}
                    className="h-14 rounded-2xl border-slate-200 font-bold pr-12" onChange={handleChange} required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors">
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-18 rounded-[1.5rem] bg-slate-950 text-white font-black text-lg shadow-2xl transition-all active:scale-95 py-6" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-3 size-6" /> : (isLogin ? "Initiate Link" : "Register Node")}
            </Button>
          </form>

          <div className="text-center mt-10 space-y-4">
            <p className="text-sm font-bold text-slate-400">
              {isLogin ? "Don't have an account?" : "Credentialed Already?"}{" "}
              <button type="button" onClick={() => toggleMode(!isLogin)} className="text-primary hover:underline font-black">
                {isLogin ? "Register Access" : "Secure Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
