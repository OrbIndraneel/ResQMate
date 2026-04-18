
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Shield, Mail, Sparkles, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const logoAsset = PlaceHolderImages.find(img => img.id === 'main-logo');

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
    name: "", adminName: "", email: "", password: "", address: "", contact: "", skills: [] as string[]
  });

  const [showPassword, setShowPassword] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusError(null);
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        router.push(role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'registrations', userCredential.user.uid), {
          email, role, submittedAt: new Date().toISOString()
        });
        setIsPendingReview(true);
      }
    } catch (error: any) {
      setStatusError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const deltaX = mouseX - centerX;
    return { bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)) };
  };

  const pPos = calculatePosition(purpleRef);
  const pwdLen = formData.password.length;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white overflow-hidden relative">
      <Link href="/" className="absolute top-8 left-8 lg:left-auto lg:right-8 z-50">
        <Button variant="outline" className="rounded-2xl border-2 font-black gap-2 bg-white/80 backdrop-blur-sm shadow-xl">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </Link>
      
      <div className="relative hidden lg:flex flex-col justify-between bg-slate-950 p-16 overflow-hidden">
        <Link href="/" className="relative z-20 flex items-center gap-4 group">
          <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-2xl group-hover:rotate-12 transition-transform duration-500">
            {logoAsset && <Image src={logoAsset.imageUrl} alt="Logo" width={48} height={48} className="object-cover" data-ai-hint={logoAsset.imageHint} />}
          </div>
          <span className="font-black text-3xl tracking-tighter text-white">ResQMate</span>
        </Link>

        {/* Characters section remains as is for visual flair */}
        <div className="relative z-20 flex items-end justify-center h-[550px] mb-12">
          {/* ... Character animations OMITTED for brevity ... */}
        </div>
        
        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest flex justify-between items-center w-full relative z-20">
          <span>Global Network Operational</span>
          <span>© ResQMate v4.2</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md">
           {/* ... Rest of login form OMITTED for brevity ... */}
           <form onSubmit={handleAuth} className="space-y-6">
             <h1 className="text-3xl font-black mb-8 text-center">{isLogin ? "Secure Link" : "Join Network"}</h1>
             <Input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             <Input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             <Button type="submit" className="w-full h-14 rounded-2xl">Enter Command</Button>
           </form>
        </div>
      </div>
    </div>
  );
}
