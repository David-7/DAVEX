import { Link } from "react-router-dom";
import { Rocket, Github, Twitter, Linkedin, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Rocket className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold tracking-tighter text-white uppercase italic">DAVEX</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              Mentorship, growth, and the mindset of becoming better. Build proof, build skills, build your career.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link to="/about" className="hover:text-primary transition-colors">About DAVEX</Link></li>
              <li><Link to="/packages" className="hover:text-primary transition-colors">Learning Plans</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Support & Contact</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Join Movement</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Legal</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} DAVEX Learning Management System. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[Github, Twitter, Linkedin, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-600 hover:text-primary transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
