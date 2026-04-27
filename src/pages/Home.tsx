import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, Shield, Trophy, Target, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[96px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded border border-primary/20 bg-primary/5 text-primary text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-8">
              <Shield className="w-3 h-3" />
              <span>Next Gen ICT Mentorship & Job Readiness</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-normal tracking-tighter mb-6 leading-none">
              BUILD PROOF. <br />
              <span className="text-primary font-mono lowercase">_skills.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              DAVEX is a technical workspace where passionate peers group through practical learning, real-world challenges, and the drive to become job ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-primary text-black px-10 py-4 rounded font-mono font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
              >
                START_LEARNING
              </Link>
              <Link 
                to="/about" 
                className="w-full sm:w-auto px-10 py-4 rounded border border-border text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-gray-500"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why DAVEX */}
      <section className="py-24 bg-shiny-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why DAVEX?</h2>
            <p className="text-gray-400">Stopping the wait, starting the building process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Target className="w-8 h-8 text-primary" />,
                title: "Practical Focus", 
                desc: "We push beyond theory into real skill, confidence, and professional readiness." 
              },
              { 
                icon: <Trophy className="w-8 h-8 text-primary" />,
                title: "Competitive Edge", 
                desc: "Our Skill Battle Arena drives consistent growth through healthy peer competition." 
              },
              { 
                icon: <Rocket className="w-8 h-8 text-primary" />,
                title: "Mentorship First", 
                desc: "Expert-led practical guidance designed for real-world ICT deployment." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black border border-white/10 p-8 rounded-2xl hover:border-primary/50 transition-colors group"
              >
                <div className="mb-6 p-4 bg-primary/5 rounded-xl inline-block group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
