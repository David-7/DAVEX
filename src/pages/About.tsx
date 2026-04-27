import { motion } from "framer-motion";
import { CheckCircle2, Users, Code, Server, Shield, Cloud } from "lucide-react";

export default function About() {
  const focusAreas = [
    { title: "IT Support", icon: <Server className="w-6 h-6" /> },
    { title: "Graphic Design", icon: <Code className="w-6 h-6" /> },
    { title: "Web Development", icon: <Code className="w-6 h-6" /> },
    { title: "Networking", icon: <Cloud className="w-6 h-6" /> },
    { title: "Linux", icon: <Server className="w-6 h-6" /> },
    { title: "Cybersecurity", icon: <Shield className="w-6 h-6" /> },
  ];

  return (
    <div className="bg-black text-white py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-black mb-8 italic text-primary">A MOVEMENT OF PASSION.</h1>
          <p className="text-gray-400 text-lg leading-relaxed text-left">
            DAVEX is a movement of passionate peers growing together through practical learning, real-world challenges, and the drive to become truly job ready. 
            We believe change begins when people stop waiting and start building. Through shared knowledge, hands-on experience, mentorship, and competitive problem-solving, we push each other beyond theory into real skill, confidence, and professional readiness.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-24">
          {focusAreas.map((area, i) => (
            <div key={i} className="flex items-center gap-3 p-6 rounded-2xl bg-shiny-black border border-white/5 hover:border-primary/20 transition-all">
              <div className="text-primary">{area.icon}</div>
              <span className="font-medium text-sm">{area.title}</span>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-12 text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4 italic">Not just a platform — a community.</h2>
          <p className="text-gray-400">
            DAVEX is driven by passion, growth, and the mindset of becoming better, stronger, and ready for what comes next.
          </p>
        </div>
      </div>
    </div>
  );
}
