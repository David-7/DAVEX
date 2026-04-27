import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { API_ROOT } from "../config";
import toast from "react-hot-toast";

export default function Login({ setUser }: { setUser: (user: any) => void }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_ROOT}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        toast.success(`Welcome back, ${data.name}!`);
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Login failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-black">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card p-10 rounded-lg border border-border shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary opacity-50" />
        
        <div className="text-center mb-10">
          <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.4em] mb-2">Authentication Layer</h2>
          <h1 className="text-3xl font-normal text-white tracking-tight">Access Terminal</h1>
          <p className="text-text-dim text-[11px] mt-2 uppercase tracking-widest font-bold">Secure Verification Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Identity</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input 
                type="email" 
                required
                placeholder="EMAIL_ADDRESS"
                className="w-full bg-black border border-border rounded pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-white text-xs font-mono"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Credential</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input 
                type="password" 
                required
                placeholder="PASSWORD"
                className="w-full bg-black border border-border rounded pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-white text-xs font-mono"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-black font-mono font-bold py-4 rounded text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 mt-6"
          >
            {loading ? "AUTHENTICATING..." : "LOGIN"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <div className="mb-4">
            <Link to="/forgot-password" className="text-text-dim hover:text-primary text-xs uppercase tracking-widest font-bold">
              Forgot Password?
            </Link>
          </div>
          <p className="text-gray-500 text-sm">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-600 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3 h-3" />
            <span>Protected by secure encrypted channel</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
