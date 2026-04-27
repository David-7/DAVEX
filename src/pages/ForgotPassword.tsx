import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        toast.success("Account found. Please verify your admission number.");
      } else {
        toast.error(data.message || "Account not found");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, admissionNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
        toast.success("Identity verified. Set your new password.");
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, admissionNumber, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset successfully! Please login.");
        navigate("/login");
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (err) {
      toast.error("An error occurred");
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
          <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.4em] mb-2">Recovery Protocol</h2>
          <h1 className="text-3xl font-normal text-white tracking-tight uppercase">Password Reset</h1>
          <p className="text-text-dim text-[11px] mt-2 uppercase tracking-widest font-bold">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Account Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input 
                  type="email" 
                  required
                  placeholder="ENTER_EMAIL"
                  className="w-full bg-black border border-border rounded pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-white text-xs font-mono"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-black font-mono font-bold py-4 rounded text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 mt-6"
            >
              {loading ? "SEARCHING..." : "VERIFY_EMAIL"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Admission Number</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input 
                  type="text" 
                  required
                  placeholder="E.G. 025J/1600"
                  className="w-full bg-black border border-border rounded pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-white text-xs font-mono"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-black font-mono font-bold py-4 rounded text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 mt-6"
            >
              {loading ? "VERIFYING..." : "VERIFY_IDENTITY"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input 
                  type="password" 
                  required
                  placeholder="NEW_PASSWORD"
                  className="w-full bg-black border border-border rounded pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-white text-xs font-mono"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest ml-1">Confirm New Password</label>
              <div className="relative">
                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input 
                  type="password" 
                  required
                  placeholder="CONFIRM_PASSWORD"
                  className="w-full bg-black border border-border rounded pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-white text-xs font-mono"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-black font-mono font-bold py-4 rounded text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 mt-6"
            >
              {loading ? "RESETTING..." : "COMMIT_RESET"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            Remembered your password? <Link to="/login" className="text-primary hover:underline">Return to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
