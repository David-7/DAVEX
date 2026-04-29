import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User as UserIcon, BookOpen, Calendar, Trophy, Zap, 
  ChevronRight, CheckCircle2, AlertCircle, Award, 
  ExternalLink, Download, MessageSquare, History, Gift
} from "lucide-react";
import ProgressChart from "../../components/Dashboard/ProgressChart.tsx";
import LessonUnits from "../../components/Dashboard/LessonUnits.tsx";
import toast from "react-hot-toast";
import { API_ROOT } from "../../config";

export default function StudentDashboard({ user: initialUser }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [prizeActive, setPrizeActive] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, sessionRes] = await Promise.all([
          fetch(`${API_ROOT}/api/dashboard/student/summary`),
          fetch(`${API_ROOT}/api/dashboard/sessions`)
        ]);
        
        if (dashRes.ok) setDashboardData(await dashRes.json());
        if (sessionRes.ok) setSessions(await sessionRes.json());
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-primary">INITIALIZING_SECURE_WORKSPACE...</div>;

  const stats = [
    { label: "Course Enrolled", value: dashboardData?.course?.enrolled, icon: <BookOpen />, sub: `Instructor: ${dashboardData?.course?.instructor}` },
    { label: "Lessons Covered", value: "14 / 28", icon: <History />, sub: "50% Complete" },
    { label: "Learning Package", value: dashboardData?.profile?.package || "BASIC", icon: <Zap className={dashboardData?.profile?.package === 'PREMIUM' ? 'text-primary' : ''} />, sub: dashboardData?.profile?.package === 'BASIC' ? "Upgrade for full access" : "Active Premium" },
    { label: "Total Skill Points", value: dashboardData?.profile?.points || "0", icon: <Trophy className="text-primary" />, sub: "Rank #4 this week" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 pt-24 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Flash Prize Banner */}
        <AnimatePresence>
          {prizeActive && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-prize text-black p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 font-bold overflow-hidden relative"
            >
              <div className="absolute inset-0 prize-hatch opacity-20 pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <Gift className="w-6 h-6" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest opacity-80">Flash Reward Active</span>
                  <span className="text-lg">5GB DATA COUPON (Claim ends in 8m 42s)</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  toast.success("CONGRATS! You claimed a 1GB Data Coupon: DAVEX-GIFT-2024");
                  setPrizeActive(false);
                }}
                className="bg-black text-white px-6 py-2 rounded border border-black/10 hover:bg-black/80 transition-all text-xs font-mono uppercase tracking-widest relative z-10"
              >
                SCRATCH TO REVEAL
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Analytics & Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 technical-card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-dim">Performance Analytics <span className="text-primary font-mono ml-2">● LIVE</span></h2>
              </div>
            </div>
            <ProgressChart />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="technical-card flex flex-col items-center text-center justify-center space-y-4"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-border flex items-center justify-center overflow-hidden">
                <UserIcon className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-black p-1 rounded border border-black/10">
                <Award className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium tracking-tight uppercase">{dashboardData?.profile?.name}</h3>
              <p className="text-[10px] text-text-dim font-mono tracking-widest mt-1">UID: {dashboardData?.profile?.studentId}</p>
            </div>
            <div className="bg-black/40 w-full rounded p-4 space-y-3 border border-border">
              <div className="flex justify-between text-[11px] uppercase tracking-widest text-text-dim">
                <span>Course Level</span>
                <span className="text-primary font-mono">{dashboardData?.course?.progress}% Complete</span>
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <div style={{ width: `${dashboardData?.course?.progress}%` }} className="h-full bg-primary" />
              </div>
            </div>
            {dashboardData?.profile?.package === "BASIC" && (
              <button 
                onClick={() => toast.success("Redirecting to secure terminal...")}
                className="w-full bg-primary text-black font-mono text-xs p-3 rounded font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                UPGRADE TO PREMIUM
              </button>
            )}
            <div className={`bg-primary/10 border border-primary text-primary px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase mt-4 ${dashboardData?.profile?.package === 'PREMIUM' ? 'opacity-100' : 'opacity-40'}`}>
              DAVEX {dashboardData?.profile?.package}
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {["overview", "courses", "skill-battle", "materials", "schedule", "chat", "leaderboard"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all uppercase tracking-widest border ${
                activeTab === tab 
                  ? "bg-primary text-black border-primary" 
                  : "bg-white/5 border-white/10 text-gray-500 hover:text-white"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {stats.map((stat, i) => (
                <div key={i} className="technical-card border-l-[3px] border-l-border hover:border-l-primary transition-all">
                  <h4 className="text-[10px] text-text-dim uppercase font-bold tracking-widest mb-3">{stat.label}</h4>
                  <p className="text-2xl font-mono text-primary font-bold">{stat.value}</p>
                  <p className="text-[10px] text-text-dim mt-2 uppercase tracking-tighter">{stat.sub}</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "courses" && (
            <motion.div 
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <LessonUnits isAdmin={false} />
            </motion.div>
          )}

          {activeTab === "skill-battle" && (
            <motion.div 
              key="skill-battle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 technical-card skill-battle-gradient">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-1 flex items-center gap-2">
                      Active Skill Battle 
                      <span className="text-red-500 font-mono text-[14px]">04:12:09 REMAINING</span>
                    </h2>
                    <h3 className="text-xl font-medium tracking-tight">Advanced Linux File System Troubleshooting</h3>
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed text-text-dim mb-8">
                  Task: Diagnose why the root partition is reporting 100% usage despite visible file totals showing 40% availability. Points: 50 Marks.
                </p>

                <div className="space-y-4">
                  <textarea 
                    className="w-full bg-black/50 border border-border rounded p-6 focus:border-primary focus:outline-none transition-all text-white text-sm font-mono" 
                    rows={6}
                    placeholder="root@davex-lms:~# _ "
                  ></textarea>
                  <button className="bg-primary text-black font-mono text-xs font-bold px-8 py-3 rounded hover:bg-primary-dark transition-all">
                    ENTER BATTLE ARENA
                  </button>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="technical-card">
                <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest mb-6">Leaderboard (Weekly)</h3>
                <div className="space-y-0 divide-y divide-border">
                  {[
                    { rank: '01', name: 'Sarah Jenkins', points: 2840 },
                    { rank: '02', name: 'Marcus Vane', points: 2610 },
                    { rank: '03', name: 'You', points: 2550, active: true },
                    { rank: '04', name: 'Lee Chen', points: 2400 },
                  ].map((player, i) => (
                    <div key={i} className="flex items-center justify-between py-3 transition-colors hover:bg-white/5">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-primary text-xs">{player.rank}</span>
                        <span className={`text-[13px] ${player.active ? 'font-bold text-white' : 'text-gray-400'}`}>{player.name}</span>
                      </div>
                      <span className="text-text-dim font-mono text-[12px]">{player.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "schedule" && (
            <motion.div key="schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto rounded-3xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="p-6">Date</th>
                    <th className="p-6">Topic</th>
                    <th className="p-6">Venue</th>
                    <th className="p-6">Mentor</th>
                    <th className="p-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map((s, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-6 font-medium">{s.date} <br/><span className="text-xs text-gray-500">{s.time}</span></td>
                      <td className="p-6 font-bold">{s.topic}</td>
                      <td className="p-6 text-primary">{s.venue}</td>
                      <td className="p-6">{s.mentor}</td>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest">Confirmed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === "materials" && (
            <motion.div key="materials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Linux Mastery PDF", size: "4.2 MB", type: "PDF", date: "Apr 20" },
                { title: "Network Config Guide", size: "1.8 MB", type: "DOCX", date: "Apr 18" },
                { title: "Cheat Sheet: NMAP", size: "512 KB", type: "IMAGE", date: "Apr 25" },
              ].map((m, i) => (
                <div key={i} className="technical-card flex items-center justify-between group cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{m.title}</h4>
                      <p className="text-[10px] text-text-dim uppercase font-mono">{m.type} • {m.size}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-dim group-hover:text-white" />
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
              <div className="lg:col-span-1 border border-border rounded-xl bg-black/40 p-4 overflow-y-auto">
                <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-4">Channels</h3>
                <div className="space-y-2 text-xs font-mono">
                  <button className="w-full text-left p-2 rounded bg-primary/10 text-primary border border-primary/20"># general-comms</button>
                  <button className="w-full text-left p-2 rounded hover:bg-white/5 transition-all"># skill-battle-talk</button>
                  <button className="w-full text-left p-2 rounded hover:bg-white/5 transition-all"># linux-mastery</button>
                  <button className="w-full text-left p-2 rounded hover:bg-white/5 transition-all"># job-readiness</button>
                </div>
              </div>
              <div className="lg:col-span-3 border border-border rounded-xl bg-black/20 flex flex-col">
                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                  {[
                    { user: "Dave (Mentor)", msg: "Welcome to the Linux Mastery session! Any issues with the root partition challenge?", time: "10:05", isMe: false },
                    { user: "You", msg: "Checking the inodes now, think I found the leak.", time: "10:12", isMe: true },
                    { user: "Sarah Lee", msg: "I'm seeing high context switching in the logs, could that be it?", time: "10:14", isMe: false },
                  ].map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!m.isMe && <span className="text-[10px] font-bold text-primary uppercase">{m.user}</span>}
                        <span className="text-[9px] text-text-dim font-mono">{m.time}</span>
                      </div>
                      <div className={`p-3 rounded-lg text-sm ${m.isMe ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-none' : 'bg-white/5 border border-border text-gray-300 rounded-tl-none'}`}>
                        {m.msg}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border">
                  <div className="relative">
                    <input type="text" placeholder="TRANSMIT_MESSAGE..." className="w-full bg-black border border-border rounded p-3 text-xs font-mono focus:border-primary focus:outline-none" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white"><Zap className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
              <div className="technical-card p-0 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-text-dim border-b border-border">
                    <tr>
                      <th className="p-6">Rank</th>
                      <th className="p-6">Learner</th>
                      <th className="p-6">Badges</th>
                      <th className="p-6">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { rank: 1, name: "Sarah Jenkins", points: 2840, badges: 12 },
                      { rank: 2, name: "Marcus Vane", points: 2610, badges: 9 },
                      { rank: 3, name: "You", points: 2550, badges: 15, isMe: true },
                      { rank: 4, name: "Lee Chen", points: 2400, badges: 7 },
                      { rank: 5, name: "Alex Riv", points: 2100, badges: 5 },
                    ].map((p, i) => (
                      <tr key={i} className={`hover:bg-white/5 transition-all ${p.isMe ? 'bg-primary/5' : ''}`}>
                        <td className="p-6 font-mono text-primary text-xl font-bold">#{p.rank}</td>
                        <td className="p-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">{p.name[0]}</div>
                          <span className={p.isMe ? 'font-bold text-white' : 'text-gray-300'}>{p.name} {p.isMe && '(YOU)'}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(3, p.badges) }).map((_, i) => (
                              <div key={i} className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,184,81,0.4)]">
                                <Trophy className="w-2 h-2 text-black" />
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-6 font-mono text-xl">{p.points.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
