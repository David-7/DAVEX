import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Rocket, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_ROOT } from "../config";

export default function Navbar({ user, setUser }: { user: any, setUser: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  // logo served from public/logo.png
  const logoUrl: string = '/logo.png';
  const location = useLocation();

  const handleLogout = async () => {
    // include CSRF token for logout
    try {
      const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
      const { csrfToken } = await tokenRes.json();
      await fetch(`${API_ROOT}/api/auth/logout`, { method: "POST", credentials: 'include', headers: { 'x-csrf-token': csrfToken || '' } });
    } catch (err) {
      await fetch(`${API_ROOT}/api/auth/logout`, { method: "POST" });
    }
    setUser(null);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/#home" },
    { name: "About", path: "/#about" },
    { name: "Packages", path: "/#packages" },
    { name: "Contact", path: "/#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith("/#")) {
      const id = path.substring(2);
      e.preventDefault();
      setIsOpen(false);
      if (location.pathname !== "/") {
        // Navigate to home first, then let the hash apply.
        navigate(`/${path.substring(1)}`);
        return;
      }
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", path);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt="DAVEX" className="w-8 h-8 rounded object-cover shadow-[0_0_15px_rgba(0,184,81,0.15)]" />
              ) : (
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-black text-black text-xl italic shadow-[0_0_15px_rgba(0,184,81,0.3)]">
                  D
                </div>
              )}
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {!location.pathname.startsWith('/dashboard') && navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                className="text-text-dim hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
              >
                {link.name}
              </a>
            ))}
            
            {user ? (
              <div className="flex items-center gap-6">
                <button onClick={handleLogout} className="text-text-dim hover:text-white">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (!location.pathname.startsWith('/dashboard') && (
              <Link 
                to="/login" 
                className="bg-primary text-black px-6 py-2 rounded font-mono font-bold text-xs hover:bg-primary-dark transition-all"
              >
                SIGN IN
              </Link>
            ))}
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
            {!location.pathname.startsWith('/dashboard') && navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.path} 
                onClick={(e) => handleNavClick(e, link.path)}
                className="text-gray-300 py-2 border-b border-white/5 uppercase font-mono text-xs tracking-widest"
              >
                {link.name}
              </a>
            ))}
            {/* If on student dashboard, surface the internal dashboard tabs here for small screens */}
            {location.pathname.startsWith('/dashboard') && user && user.role !== 'ADMIN' && (
              <div className="pt-4 border-t border-white/5">
                {['overview','courses','skill-battle','materials','schedule','chat','leaderboard'].map((t) => (
                  <button key={t} onClick={() => { window.location.hash = t; setIsOpen(false); }} className="w-full text-left py-3 uppercase font-mono text-xs tracking-widest text-text-dim">{t.replace('-',' ')}</button>
                ))}
              </div>
            )}
            {user ? (
              <>
                <button onClick={handleLogout} className="text-red-400 text-left py-2">Logout</button>
              </>
            ) : (!location.pathname.startsWith('/dashboard') && (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="bg-primary text-black p-3 rounded-xl text-center font-bold"
              >
                Get Started
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
