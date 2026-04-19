
"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Heart, Star, 
  MapPin, Quote, ArrowRight,
  TrendingUp, Activity, Users
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

const logoAsset = PlaceHolderImages.find(img => img.id === 'main-logo');
const storyImages = [
  PlaceHolderImages.find(img => img.id === 'story-1'),
  PlaceHolderImages.find(img => img.id === 'story-2'),
  PlaceHolderImages.find(img => img.id === 'story-3'),
];

const StoryCard = ({ story, index }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="premium-card overflow-hidden group"
  >
    <div className="relative h-72 w-full">
      <Image 
        src={story.image.imageUrl} 
        alt={story.title} 
        fill 
        className="object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute top-4 left-4">
        <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
           <MapPin className="h-3 w-3 text-primary" /> {story.location}
        </div>
      </div>
    </div>
    <div className="p-10 space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Mission</span>
      </div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">{story.title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-6">
        "{story.excerpt}"
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
            {story.author[0]}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">{story.author}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{story.role}</p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function StoriesPage() {
  const stories = [
    {
      title: "The Sector 4 Bridge",
      location: "San Francisco Suburbs",
      excerpt: "When the floods hit, we had zero coordination. ResQMate matched us with 14 heavy-lift certified responders in 20 minutes. It saved our local clinic.",
      author: "Sarah Chen",
      role: "NGO Logistics Lead",
      image: storyImages[0]
    },
    {
      title: "Medical Supply Chain Success",
      location: "Downtown Medical Camp",
      excerpt: "Nurses and doctors were waiting for insulin. The ResQMate alert system pinged three drivers who were only 5 minutes away. Critical care wasn't interrupted.",
      author: "Dr. Marcus Thorne",
      role: "Field Surgeon",
      image: storyImages[1]
    },
    {
      title: "Independent Response Hero",
      location: "Urban Shelter",
      excerpt: "I just wanted to help. ResQMate verified my IT skills and matched me with a shelter that needed their network restored for family tracking. Impact is real.",
      author: "David Miller",
      role: "Volunteer Responder",
      image: storyImages[2]
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
            Real missions. Real responders. Real outcomes. Discover how ResQMate is transforming the landscape of humanitarian relief one mission at a time.
          </p>
        </section>

        {/* Stats Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: "Lives Influenced", val: "124,000", icon: Activity, color: "text-blue-600" },
             { label: "Verified Responders", val: "15,200", icon: Users, color: "text-emerald-600" },
             { label: "Response Score", val: "99.2%", icon: TrendingUp, color: "text-primary" }
           ].map((s, i) => (
             <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 flex items-center justify-between">
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                 <p className={`text-4xl font-black ${s.color} tracking-tighter`}>{s.val}</p>
               </div>
               <s.icon className={`h-10 w-10 ${s.color} opacity-20`} />
             </div>
           ))}
        </section>

        <section className="grid md:grid-cols-3 gap-10">
          {stories.map((story, i) => (
            <StoryCard key={i} story={story} index={i} />
          ))}
        </section>

        <section className="bg-white rounded-[3.5rem] p-16 border border-slate-100 text-center space-y-10">
          <Quote className="h-16 w-16 text-primary mx-auto opacity-20" />
          <h2 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter">Your mission starts here.</h2>
          <p className="text-slate-500 font-medium text-xl max-w-xl mx-auto">Join thousands of organizations and responders making a difference every single day.</p>
          <div className="flex justify-center gap-6">
            <Link href="/login?mode=register">
              <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-black text-lg group">
                Become a Responder <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} ResQMate Humanitarian Operations Center.</p>
        </div>
      </footer>
    </div>
  );
}
