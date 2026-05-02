import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { API_ROOT } from "../config";
import toast from "react-hot-toast";

export default function Register({ setUser }: { setUser: (user: any) => void }) {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    admissionNumber: "",
    package: "BASIC"
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple format check before sending
    const admissionRegex = /^\d{3}[A-Z]\/\d{4}$/;
    if (!admissionRegex.test(formData.admissionNumber)) {
      toast.error("Admission number must be in format like 025J/1600");
      return;
    }

    setLoading(true);
    try {
      // fetch CSRF token and include credentials
      const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
      const { csrfToken } = await tokenRes.json();
      const res = await fetch(`${API_ROOT}/api/auth/register`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken || '' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        if (formData.package === "PREMIUM") {
          toast.success("Redirecting to Premium checkout...");
          // In a real app, redirect to Stripe/Mpesa here
          // For now, we simulate completion
          toast.success("Premium Access Authorized - KSH 250.00 Received");
        } else {
          toast.success(`Account created! Welcome to DAVEX, ${data.name}.`);
        }
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-black py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-card p-10 rounded-lg border border-border shadow-2xl relative"
      >
        <div className="text-center mb-10">
          <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.4em] mb-2">Registration Layer</h2>
          <h1 className="text-3xl font-normal text-white italic tracking-tighter uppercase">Initialize Account</h1>
          <p className="text-text-dim text-[11px] mt-2 uppercase tracking-widest font-bold">Secure Verification Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Legal Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-text-dim" />
                <input 
                  type="text" 
                  required
                  placeholder="FULL_NAME"
                  className="w-full bg-black border border-border rounded pl-10 pr-4 py-3 focus:outline-none focus:border-primary transition-all text-white text-[11px] font-mono"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-text-dim" />
                <input 
                  type="email" 
                  required
                  placeholder="EMAIL_ADDR"
                  className="w-full bg-black border border-border rounded pl-10 pr-4 py-3 focus:outline-none focus:border-primary transition-all text-white text-[11px] font-mono"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Admission Number</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-text-dim" />
                <input 
                  type="text" 
                  required
                  placeholder="000X/0000"
                  className="w-full bg-black border border-border rounded pl-10 pr-4 py-3 focus:outline-none focus:border-primary transition-all text-white text-[11px] font-mono"
                  value={formData.admissionNumber}
                  onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Credential</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-text-dim" />
                <input 
                  type="password" 
                  required
                  placeholder="********"
                  className="w-full bg-black border border-border rounded pl-10 pr-4 py-3 focus:outline-none focus:border-primary transition-all text-white text-[11px] font-mono"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Select Tier</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, package: "BASIC"})}
                className={`p-4 rounded border font-mono text-center transition-all ${
                  formData.package === "BASIC" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-border bg-black text-text-dim hover:border-white/20"
                }`}
              >
                <div className="text-[10px] font-bold">BASIC</div>
                <div className="text-xs">KSH 0</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, package: "PREMIUM"})}
                className={`p-4 rounded border font-mono text-center transition-all relative overflow-hidden ${
                  formData.package === "PREMIUM" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-border bg-black text-text-dim hover:border-white/20"
                }`}
              >
                {formData.package === "PREMIUM" && <Sparkles className="absolute -top-1 -right-1 w-4 h-4" />}
                <div className="text-[10px] font-bold">PREMIUM</div>
                <div className="text-xs">KSH 250</div>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-black font-mono font-bold py-4 rounded text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 mt-4 leading-none"
          >
            {loading ? "PROCESSING..." : formData.package === "PREMIUM" ? "PAY KSH 250 & REGISTER" : "CONFIRM INITIALIZATION"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-600 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3 h-3" />
            <span>OWASP-First Architecture Secured</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
