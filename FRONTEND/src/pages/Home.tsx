import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,184,81,0.05),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-6">
              Next-Gen Learning OS
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1]">
              MASTER YOUR TECH <br />
              <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">BEYOND LIMITS.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-text-dim text-lg mb-10 leading-relaxed">
              DAVEX is the ultimate Learning Management System for IT professionals. 
              Real-time skill battles, premium resources, and a focus on growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-primary text-black font-bold px-10 py-4 rounded hover:bg-white transition-all flex items-center justify-center gap-2 group"
              >
                ACCESS TERMINAL
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto bg-white/5 border border-white/10 text-white font-bold px-10 py-4 rounded hover:bg-white/10 transition-all"
              >
                VIEW MISSION
              </Link>
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
                title: "Currated Content", 
                desc: "Expert-led lesson units designed for fast industrial adoption." 
              },
              { 
                icon: <Globe className="w-6 h-6 text-primary" />, 
                title: "Global Network", 
                desc: "Connect with IT professionals and mentors across the globe." 
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
    </div>
  );
}
