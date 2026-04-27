import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Rocket, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ user, setUser }: { user: any, setUser: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Packages", path: "/packages" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Rocket className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tighter text-white font-mono">DAVEX</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-text-dim hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-6">
                <Link 
                  to="/dashboard" 
                  className="bg-primary/5 text-primary px-4 py-2 rounded border border-primary/20 flex items-center gap-2 hover:bg-primary hover:text-black transition-all text-xs font-mono font-bold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  DASHBOARD
                </Link>
                <button onClick={handleLogout} className="text-text-dim hover:text-white">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-primary text-black px-6 py-2 rounded font-mono font-bold text-xs hover:bg-primary-dark transition-all"
              >
                SIGN IN
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-shiny-black border-b border-white/10 px-4 py-6 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className="text-gray-300 py-2 border-b border-white/5"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="bg-primary/10 text-primary p-3 rounded-xl flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-red-400 text-left py-2">Logout</button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="bg-primary text-black p-3 rounded-xl text-center font-bold"
              >
                Get Started
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
