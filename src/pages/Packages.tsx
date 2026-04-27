import { motion } from "framer-motion";
import { Check, X, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Packages() {
  const plans = [
    {
      name: "BASIC PLAN",
      price: "FREE",
      description: "Perfect for beginners starting practical ICT learning.",
      features: [
        { text: "Core learning materials", included: true },
        { text: "Selected notes & guides", included: true },
        { text: "Limited mentorship support", included: true },
        { text: "Beginner practical tasks", included: true },
        { text: "Community discussions", included: true },
        { text: "Basic progress tracking", included: true },
        { text: "Premium mentorship", included: false },
        { text: "Advanced project access", included: false },
        { text: "Portfolio building support", included: false },
      ],
      cta: "Get Started",
      highlight: false
    },
    {
      name: "DAVEX PREMIUM",
      price: "SECURE ACCESS",
      description: "Built for serious learners who want job readiness.",
      features: [
        { text: "Full 1-on-1 mentorship", included: true },
        { text: "Personalized tech support", included: true },
        { text: "All learning resources access", included: true },
        { text: "Priority real-world projects", included: true },
        { text: "Advanced practical challenges", included: true },
        { text: "Portfolio building support", included: true },
        { text: "Video practical proof creation", included: true },
        { text: "Internship prep & CV review", included: true },
        { text: "Private resource vault", included: true },
      ],
      cta: "Go Premium",
      highlight: true
    }
  ];

  return (
    <div className="bg-black text-white py-24 px-4 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-5xl font-black text-center mb-4 tracking-tighter italic">LEARNING PLANS FOR GROWTH</h1>
        <p className="text-gray-400 text-center mb-16 text-lg">Choose the package that matches your journey.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`relative rounded-3xl p-8 flex flex-col border transition-all ${
                plan.highlight 
                  ? "bg-shiny-black border-primary/40 shadow-[0_0_40px_rgba(0,255,0,0.1)] scale-105" 
                  : "bg-black border-white/10"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  RECOMMENDED
                </div>
              )}
              
              <div className="mb-8">
                <h3 className={`text-2xl font-black mb-2 italic ${plan.highlight ? "text-primary" : ""}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-white/20 shrink-0" />
                    )}
                    <span className={feature.included ? "text-white" : "text-white/30"}>{feature.text}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/register" 
                className={`w-full py-4 rounded-xl text-center font-bold transition-all ${
                  plan.highlight 
                    ? "bg-primary text-black hover:bg-primary-dark" 
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <p className="text-2xl italic font-light text-gray-300">
            "Don't Just Learn — <span className="text-primary font-black">Build Proof</span>, Build Skills, Build Your Career."
          </p>
        </div>
      </div>
    </div>
  );
}
