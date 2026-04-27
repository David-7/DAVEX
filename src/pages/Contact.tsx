import { motion } from "framer-motion";
import { Mail, Phone, ShieldCheck, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      toast.success("Message sent securely! We'll get back to you soon.");
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="bg-black text-white py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-6xl font-black mb-6 italic tracking-tighter">GET IN <span className="text-primary italic">TOUCH.</span></h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Have questions about our programs or technical sessions? Our team is here to support your growth.
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                { icon: <Mail className="w-6 h-6" />, label: "Email Support", value: "support@davex.lms" },
                { icon: <Phone className="w-6 h-6" />, label: "Call Us", value: "+254 7XX XXX XXX" },
                { icon: <ShieldCheck className="w-6 h-6 text-primary" />, label: "Secure Communication", value: "End-to-End Encrypted" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/20 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{item.label}</h4>
                    <p className="text-white font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-shiny-black p-8 rounded-3xl border border-white/10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Subject</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  required 
                  rows={4}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Secure Message"}
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
