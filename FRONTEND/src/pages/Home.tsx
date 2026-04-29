import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles, Check, Mail, Phone, MapPin } from "lucide-react";

export default function Home() {
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
    <div className="min-h-screen bg-black text-white">
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

      {/* About Section */}
      <section id="about" className="py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.5em] mb-4">Core Mission</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">EMPOWERING THE NEXT <br /> GENERATION OF TECH LEADERS</h3>
            <p className="text-text-dim max-w-2xl mx-auto text-lg leading-relaxed mb-12">
              DAVEX provides high-end IT support solutions and learning paths tailored for the modern industrial landscape. 
              We bridge the gap between academic knowledge and operational excellence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left max-w-4xl mx-auto">
              <div className="space-y-4">
                <h4 className="font-bold text-white uppercase tracking-widest text-sm italic">Our Vision</h4>
                <p className="text-text-dim text-sm font-mono tracking-tight">To become the global standard for rapid technical skill acquisition and industrial readiness in the IT sector.</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-white uppercase tracking-widest text-sm italic">Our Commitment</h4>
                <p className="text-text-dim text-sm font-mono tracking-tight">Constant iteration of our curriculum ensures our students are always ahead of the technological curve.</p>
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
            <p className="text-text-dim max-w-2xl mx-auto font-mono text-xs tracking-widest uppercase">Select your operational tier</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-10 border rounded-xl flex flex-col items-center gap-6 relative overflow-hidden ${
                  plan.highlight 
                    ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(0,184,81,0.1)]" 
                    : "border-border bg-[#0a0a0a]"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-4 right-4 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-text-dim mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold tracking-tighter mb-2">{plan.price}</div>
                  <p className="text-xs text-text-dim tracking-wide h-8">{plan.description}</p>
                </div>

                <ul className="w-full space-y-4 my-6">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-xs font-mono text-gray-400">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full py-4 rounded font-mono font-bold text-xs uppercase tracking-widest transition-all text-center ${
                    plan.highlight 
                      ? "bg-primary text-black hover:bg-white" 
                      : "bg-white/5 text-white hover:bg-white/10 border border-border"
                  }`}
                >
                  SELECT {plan.name}
                </Link>
              </motion.div>
            ))}
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
            <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.5em] mb-4">Connect</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-8">Reach the node</h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-dim mb-1">Direct Comms</h4>
                  <p className="text-white font-mono">support@davex.lms</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary transition-all">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-dim mb-1">Secure Line</h4>
                  <p className="text-white font-mono">+254 700 000 000</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary transition-all">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-dim mb-1">HQ Site</h4>
                  <p className="text-white font-mono">Nairobi IT District, Level 4</p>
                </div>
              </div>
            </div>

            <div className="technical-card border-primary/20 bg-primary/5 p-8">
              <form className="space-y-4">
                <input 
                  type="text" 
                  placeholder="SUBJECT_LINE"
                  className="w-full bg-black border border-border rounded p-4 text-xs font-mono text-white focus:border-primary focus:outline-none"
                />
                <textarea 
                  rows={4}
                  placeholder="ENCRYPTED_MESSAGE"
                  className="w-full bg-black border border-border rounded p-4 text-xs font-mono text-white focus:border-primary focus:outline-none"
                />
                <button className="w-full bg-primary text-black font-bold py-4 rounded text-xs uppercase tracking-widest font-mono">
                  TRANSMIT SIGNAL
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
