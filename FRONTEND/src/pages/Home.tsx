import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles, Check, Mail, Phone, MapPin } from "lucide-react";

const CONTACT_EMAIL = "icursoride@gmail.com";

export default function Home() {
  const location = useLocation();
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      // small timeout so the section has mounted
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [location.hash]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(contactSubject || "DAVEX Inquiry");
    const body = encodeURIComponent(contactMessage || "");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const plans = [
    {
      name: "Basic",
      price: "KSH 0.00",
      description: "Standard entry-level access for students.",
      features: ["Curriculum Access", "Community Forum", "Profile Badge", "Basic Skill Battles"],
      highlight: false
    },
    {
      name: "Premium",
      price: "KSH 250.00",
      description: "Advanced industrial modules and priority support.",
      features: [
        "All Basic Features",
        "Advanced Lesson Units",
        "Skill Battle Tournaments",
        "Direct Mentor Support",
        "Priority Certification"
      ],
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white bg-dot-grid">
      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,184,81,0.05),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-6">
              Next-Gen LMS
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1]">
              MASTER YOUR TECH <br />
              <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">BEYOND LIMITS.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-text-dim text-lg mb-10 leading-relaxed">
              DAVEX is the ultimate Learning Management System for aspiring IT professionals in KANDARA TECHNICAL COLLEGE. <br></br>
              It features real-time skill battles, premium resources, and a focus on growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-primary text-black font-bold px-10 py-4 rounded hover:bg-white transition-all flex items-center justify-center gap-2 group"
              >
                SIGN UP
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#about"
                className="w-full sm:w-auto bg-white/5 border border-white/10 text-white font-bold px-10 py-4 rounded hover:bg-white/10 transition-all font-mono text-xs uppercase tracking-widest flex items-center justify-center"
              >
                VIEW MISSION
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-[#050505] border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Zap className="w-6 h-6 text-primary" />, 
                title: "Skill Battles", 
                desc: "Real-time technical challenges to test your limits against peers." 
              },
              { 
                icon: <ShieldCheck className="w-6 h-6 text-primary" />, 
                title: "Curated Content", 
                desc: "Expert-led lesson units designed for fast industrial adoption." 
              },
              { 
                icon: <Globe className="w-6 h-6 text-primary" />, 
                title: "Global Network", 
                desc: "Learn what the global masters have curated" 
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="technical-card hover:border-primary/50 transition-all p-8"
              >
                <div className="mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-text-dim text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.5em] mb-4">The Movement</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8 max-w-4xl mx-auto uppercase italic">
              A community of passionate peers <br className="hidden md:block" /> growing together
            </h3>
            
            <div className="max-w-3xl mx-auto text-lg leading-relaxed mb-16 text-text-dim space-y-6">
              <p>
                DAVEX is a movement of passionate peers growing together through practical learning, real-world challenges, and the drive to become truly job ready.
              </p>
              <p>
                We believe change begins when people stop waiting and start building. Through shared knowledge, hands-on experience, mentorship, and competitive problem-solving, we push each other beyond theory into real skill, confidence and professional readiness.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                "IT Support", "Graphic Design", "Web Development", 
                "Networking", "Linux", "Skills Upgrade", 
                "Digital Marketing", "Cloud Infrastructure"
              ].map((skill) => (
                <div key={skill} className="p-4 bg-white/5 border border-white/10 rounded-lg font-mono text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors">
                  {skill}
                </div>
              ))}
            </div>

            <div className="mt-20 p-10 border border-primary/20 bg-primary/5 rounded-2xl max-w-4xl mx-auto text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-40 h-40" />
              </div>
              <h4 className="text-xl font-bold mb-4 uppercase italic">Not Just a Platform</h4>
              <p className="text-text-dim text-sm leading-relaxed mb-6 font-mono">
                DAVEX is a community driven by passion, growth, and the mindset of becoming better, stronger, and ready for what comes next. Don’t Just Learn — Build Proof, Build Skills, Build Your Career.
              </p>
              <div className="flex gap-4">
                <Link to="/register" className="bg-primary text-black px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-32 bg-[#050505] border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.5em] mb-4">Operational Tiers</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 italic uppercase">Packages</h3>
            <p className="text-text-dim max-w-2xl mx-auto font-mono text-xs tracking-widest uppercase">Choose the plan that matches your journey</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 border border-border bg-[#0a0a0a] rounded-2xl flex flex-col items-start text-left relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:bg-white/10 transition-all" />
              <h3 className="text-xs font-mono font-bold text-text-dim uppercase tracking-[0.4em] mb-2">Basic Plan</h3>
              <div className="text-4xl font-bold mb-4">KSH 0.00</div>
              <p className="text-xs text-text-dim font-mono mb-8 uppercase tracking-widest">Core Essentials</p>
              
              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  "Core learning materials", "Selected notes",
                  "Community discussions",
                  "Limited mentorship support", "Beginner practical tasks",
                  "Basic progress tracking"
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
                    <Check className="w-3 h-3 text-primary shrink-0" /> {item}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-[11px] font-mono text-red-500/60 line-through">
                  Community Drive Access
                </li>
                 <li className="flex items-center gap-3 text-[11px] font-mono text-red-500/60 line-through">
                  Personalized portfolio video
                </li>
                 <li className="flex items-center gap-3 text-[11px] font-mono text-red-500/60 line-through">
                  Personalized guide
                </li>
                 <li className="flex items-center gap-3 text-[11px] font-mono text-red-500/60 line-through">
                  Professional support
                </li>
              </ul>

              <Link to="/register" className="w-full bg-white/5 border border-white/10 text-white py-4 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center">
                Select Basic
              </Link>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 border border-primary bg-primary/5 rounded-2xl flex flex-col items-start text-left relative shadow-[0_0_50px_rgba(0,184,81,0.1)] group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-primary">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.4em] mb-2">DAVEX Premium</h3>
              <div className="text-4xl font-bold mb-4 text-white">KSH 250.00</div>
              <p className="text-xs text-primary font-mono mb-8 uppercase tracking-widest">Full Operational Power</p>
              
              <ul className="grid grid-cols-1 gap-y-3 mb-10 flex-grow">
                {[
                  "Full 1-on-1 mentorship", "Personalized technical support",
                  "Advanced practical challenges", "Portfolio building support",
                  "CV improvement & Internship prep", "Video practical proof creation",
                  "Premium Drive (Tutorials, Projects)", "Private resource vault"
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[11px] font-mono text-gray-300">
                    <Zap className="w-3 h-3 text-primary shrink-0 fill-primary" /> {item}
                  </li>
                ))}
              </ul>

              <Link to="/register" className="w-full bg-primary text-black py-4 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all text-center">
                GO PREMIUM NOW
              </Link>
            </motion.div>
          </div>
          
          <div className="mt-16">
            <p className="text-xs font-mono text-text-dim uppercase tracking-[0.2em]">
              At DAVEX, we focus on practical growth employers can actually see.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.5em] mb-4">Let's Connect</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-8">Reach the node</h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-dim mb-1">Direct Email</h4>
                  <p className="text-white font-mono">icursoride@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary transition-all">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-dim mb-1">Comm Line</h4>
                  <p className="text-white font-mono">+254 701 759 905</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary transition-all">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-dim mb-1">HQ Site</h4>
                  <p className="text-white font-mono">KANDARA TECH COLLEGE, ICT Department</p>
                </div>
              </div>
            </div>

            <div className="technical-card border-primary/20 bg-primary/5 p-8">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="SUBJECT_LINE/ ABOUT"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full bg-black border border-border rounded p-4 text-xs font-mono text-white focus:border-primary focus:outline-none"
                />
                <textarea 
                  rows={4}
                  placeholder="YOUR_MESSAGE"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-black border border-border rounded p-4 text-xs font-mono text-white focus:border-primary focus:outline-none"
                />
                <button type="submit" className="w-full bg-primary text-black font-bold py-4 rounded text-xs uppercase tracking-widest font-mono hover:bg-white transition-all">
                  SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
