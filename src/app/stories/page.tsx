"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Heart, Star, 
  MapPin, Quote, ArrowRight,
  TrendingUp, Activity, Users, ShieldCheck
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

const logoAsset = PlaceHolderImages.find(img => img.id === 'main-logo');

const StoryCard = ({ story, index }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: (index % 3) * 0.1 }}
    viewport={{ once: true }}
    className="premium-card overflow-hidden group h-full flex flex-col"
  >
    <div className="relative h-64 w-full">
      <Image 
        src={story.image.imageUrl} 
        alt={story.title} 
        fill 
        className="object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute top-4 left-4">
        <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
           <MapPin className="h-3 w-3 text-primary" /> {story.location}
        </div>
      </div>
    </div>
    <div className="p-8 space-y-4 flex-1 flex flex-col">
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Report</span>
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">{story.title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-6 text-sm flex-1">
        "{story.excerpt}"
      </p>
      <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs shrink-0">
          {story.author[0]}
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 leading-none">{story.author}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{story.role}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function StoriesPage() {
  const stories = [
    {
      title: "The Low-Signal Lifeline",
      location: "Darbhanga, Bihar",
      excerpt: "When cellular signals failed in the 2024 floods, ResQmate's low-bandwidth ping sent coordinates to the rescue boats. Within hours, we saved families trapped on collapsing roofs.",
      author: "Rajesh Kumar",
      role: "Senior Field Coordinator",
      image: PlaceHolderImages.find(img => img.id === 'story-1')
    },
    {
      title: "The Golden Hour",
      location: "Uttarakhand Hills",
      excerpt: "In a landslide zone with no doctor, I used the ResQmate AI Chatbot. Step-by-step instructions helped me stabilize a life-threatening injury until the Army medevac arrived.",
      author: "Priyanka Sharma",
      role: "Emergency Response Volunteer",
      image: PlaceHolderImages.find(img => img.id === 'story-2')
    },
    {
      title: "Precision Aid Mapping",
      location: "Drought Affected Sector",
      excerpt: "We stopped guessing and started delivering. ResQmate's heat map showed us exactly where aid was clumping and where supplies were missing. Not a single kilo of ration was wasted.",
      author: "Sanjay Mehta",
      role: "Logistics Manager",
      image: PlaceHolderImages.find(img => img.id === 'story-3')
    },
    {
      title: "Digital DNA Reunification",
      location: "Cyclone Shelter Delta",
      excerpt: "In the chaos, I thought I had lost everything. But through the ResQmate family logs, I found my daughter's location at a separate shelter within 10 minutes of searching.",
      author: "Rahul Das",
      role: "Cyclone Survivor",
      image: PlaceHolderImages.find(img => img.id === 'story-4')
    },
    {
      title: "Breaking the Silence",
      location: "Himachal Forest Zone",
      excerpt: "When the 4G towers burned down, I thought we were trapped. Then an automated offline SMS from ResQmate showed our group the only safe escape route via 2G.",
      author: "Deepak Varma",
      role: "Trekker Group Lead",
      image: PlaceHolderImages.find(img => img.id === 'story-5')
    },
    {
      title: "The Sentinel: NASA Sync",
      location: "Maharashtra Ghats",
      excerpt: "We didn't just react; we outsmarted it. NASA's predictive tech on ResQmate flagged a 90% risk at 2 AM. By 5 AM, the hill collapsed, but every villager was already safe.",
      author: "Dr. Ananya Rao",
      role: "Disaster Prevention Specialist",
      image: PlaceHolderImages.find(img => img.id === 'story-6')
    },
    {
      title: "Social Media Mining",
      location: "Urban Flood Zone",
      excerpt: "I posted an SOS on Twitter as a last resort. I never expected an NGO to show up at my flooded basement in 20 minutes because an app alert scraped my post.",
      author: "Ishaan Malhotra",
      role: "Resident Survivor",
      image: PlaceHolderImages.find(img => img.id === 'story-7')
    },
    {
      title: "Hyper-Coordination Pulse",
      location: "Industrial Sector",
      excerpt: "Managing 200 people during a chemical leak is usually a nightmare. With ResQmate, I knew exactly where every volunteer was and who needed help next in real-time.",
      author: "Sunita Deshmukh",
      role: "Operations Head",
      image: PlaceHolderImages.find(img => img.id === 'story-8')
    },
    {
      title: "The Safe Path Protocol",
      location: "Gujarat Earthquake Zone",
      excerpt: "Rumors kill more than disasters. By pushing verified bulletins through ResQmate, we stopped a stampede and allowed ambulances to move through the panic.",
      author: "Nitin Gadvi",
      role: "Communication Lead",
      image: PlaceHolderImages.find(img => img.id === 'story-9')
    },
    {
      title: "Medical Triage Success",
      location: "Emergency Transit Camp",
      excerpt: "The app's triage system flagged critical cases that my tired nurses might have missed, identifying a potential epidemic before it could spread through the camp.",
      author: "Dr. Sameer Khan",
      role: "Medical Volunteer",
      image: PlaceHolderImages.find(img => img.id === 'story-10')
    },
    {
      title: "The Post-Disaster Audit",
      location: "Regional Command Center",
      excerpt: "Transparency wins trust. Showing every SOS and rescue on a verified map helped us secure double the funding for next year's operational mission.",
      author: "Tushar Kapoor",
      role: "NGO Director",
      image: PlaceHolderImages.find(img => img.id === 'story-11')
    }
  ];

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
        <Link href="/">
          <Button variant="ghost" className="font-bold gap-2"><ArrowLeft className="h-4 w-4" /> Home</Button>
        </Link>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16 space-y-24">
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100">
            <Heart className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-black uppercase text-rose-600 tracking-widest">Global Impact Journal</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-950 max-w-4xl mx-auto leading-tight">
            Voices from the <span className="text-primary">Ground.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Real missions. Real responders. Real outcomes. Discover how ResQMate is transforming humanitarian relief one verified action at a time.
          </p>
        </section>

        {/* Stats Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: "Lives Influenced", val: "124,000", icon: Activity, color: "text-blue-600" },
             { label: "Verified Responders", val: "15,200", icon: Users, color: "text-emerald-600" },
             { label: "Response Score", val: "99.2%", icon: TrendingUp, color: "text-primary" }
           ].map((s, i) => (
             <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                 <p className={`text-4xl font-black ${s.color} tracking-tighter`}>{s.val}</p>
               </div>
               <s.icon className={`h-10 w-10 ${s.color} opacity-20`} />
             </div>
           ))}
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <StoryCard key={i} story={story} index={i} />
          ))}
        </section>

        <section className="bg-slate-900 rounded-[3.5rem] p-16 md:p-24 text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
          <Quote className="h-16 w-16 text-primary mx-auto opacity-40 mb-4" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter relative z-10 leading-tight">Your mission starts <span className="text-primary">here.</span></h2>
          <p className="text-slate-400 font-medium text-xl max-w-xl mx-auto relative z-10">Join the thousands of organizations and responders making a difference every single day.</p>
          <div className="flex justify-center gap-6 relative z-10 pt-4">
            <Link href="/login?mode=register">
              <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-slate-950 font-black text-lg group hover:scale-105 transition-transform">
                Become a Responder <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-6 w-6 rounded-lg overflow-hidden shadow">
              {logoAsset && <Image src={logoAsset.imageUrl} alt="Logo" width={24} height={24} className="object-cover" />}
            </div>
            <span className="font-black text-slate-900 tracking-tight text-sm">ResQMate Humanitarian Operations</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} ResQMate Core. All impact reports are cryptographically verified.</p>
        </div>
      </footer>
    </div>
  );
}