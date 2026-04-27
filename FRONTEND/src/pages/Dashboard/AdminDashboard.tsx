import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_ROOT } from "../../config";
import { 
  Users, BookOpen, Trophy, CreditCard, Plus, 
  Settings, Search, ArrowUpRight, Check, X,
  LayoutDashboard, List, Gift, Calendar
} from "lucide-react";

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch(`${API_ROOT}/api/dashboard/admin/summary`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Admin data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-primary uppercase tracking-[0.3em]">Accessing_Admin_Core_Node...</div>;

  const stats = data?.stats || [];
  const pendingPayments = data?.pendingPayments || [];

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border p-8 space-y-8 hidden lg:flex flex-col pt-24">
        <div className="space-y-2">
          <h4 className="text-[10px] text-text-dim uppercase tracking-[0.3em] font-bold mb-6">Control Center</h4>
          {[
            { id: "overview", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "students", label: "Students", icon: <Users className="w-4 h-4" /> },
            { id: "courses", label: "Learning Paths", icon: <BookOpen className="w-4 h-4" /> },
            { id: "skill-battle", label: "Skill Battle", icon: <Trophy className="w-4 h-4" /> },
            { id: "prizes", label: "Rewards", icon: <Gift className="w-4 h-4" /> },
            { id: "sessions", label: "Schedule", icon: <Calendar className="w-4 h-4" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-4 px-0 py-3 text-xs font-bold transition-all uppercase tracking-widest ${
                activeView === item.id ? "text-primary" : "text-text-dim hover:text-white"
              }`}
            >
              <span className="w-6">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-8 pt-16 md:pt-24 space-y-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-normal tracking-tight">Admin Workspace</h1>
            <div className="font-mono text-[11px] text-text-dim uppercase mt-1">Status: Global Commander • Node: DVX-ROOT</div>
          </div>
          <div className="flex gap-3">
            <button className="bg-primary/5 text-primary border border-primary/20 px-6 py-2 rounded text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-black transition-all">
              <Plus className="w-4 h-4" />
              NEW ENTITY
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat: any, i: number) => (
            <div key={i} className="technical-card border-l-2 border-l-border hover:border-l-primary transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/5 rounded text-text-dim">
                  {stat.icon === 'users' && <Users className="w-4 h-4" />}
                  {stat.icon === 'book' && <BookOpen className="w-4 h-4" />}
                  {stat.icon === 'dollar' && <Trophy className="w-4 h-4" />}
                  {stat.icon === 'trending' && <Calendar className="w-4 h-4" />}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-primary font-mono">
                  {stat.trend}
                </div>
              </div>
              <h4 className="text-[10px] text-text-dim uppercase font-bold tracking-widest mb-1">{stat.label}</h4>
              <p className="text-2xl font-mono font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Dynamic View Content */}
        {activeView === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="technical-card">
              <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest mb-6">Payment Queue <span className="text-primary font-mono ml-2">● {pendingPayments.length} Pending</span></h3>
              <div className="space-y-0 divide-y divide-border">
                {pendingPayments.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-[13px] font-medium text-white">{p.name}</p>
                      <p className="font-mono text-[10px] text-text-dim uppercase mt-1">{p.type} • ${p.amount}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 border border-border rounded hover:bg-primary/10 hover:text-primary transition-all">
                        <Check className="w-3 h-3" />
                      </button>
                      <button className="p-2 border border-border rounded hover:bg-red-500/10 hover:text-red-500 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="technical-card">
              <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest mb-6">Battle Submissions</h3>
              <div className="space-y-0 divide-y divide-border">
                {[
                  { name: "Kevin Hart", battle: "Networking Lab", date: "2h ago" },
                  { name: "Diana Rose", battle: "Linux CLI", date: "5h ago" },
                ].map((s, i) => (
                  <div key={i} className="py-4 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-medium text-white group-hover:text-primary transition-colors">{s.name}</p>
                        <p className="font-mono text-[10px] text-text-dim uppercase mt-1">{s.battle} • {s.date}</p>
                      </div>
                      <ArrowUpRight className="w-3 h-3 text-text-dim group-hover:text-primary transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
