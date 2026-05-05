import { useState, useEffect, useRef } from "react";
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
import { io, Socket } from 'socket.io-client';

export default function StudentDashboard({ user: initialUser }: { user: any }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) return window.location.hash.replace('#','');
    return 'overview';
  });
  const [prizeActive, setPrizeActive] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const [activePrize, setActivePrize] = useState<any | null>(null);
  const [activeBattle, setActiveBattle] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, sessionRes] = await Promise.all([
          fetch(`${API_ROOT}/api/dashboard/student/summary`, { credentials: 'include' }),
          fetch(`${API_ROOT}/api/dashboard/sessions`, { credentials: 'include' }),
          fetch(`${API_ROOT}/api/dashboard/leaderboard`, { credentials: 'include' })
        ]);
        
        if (dashRes.ok) setDashboardData(await dashRes.json());
        if (sessionRes.ok) setSessions(await sessionRes.json());
        // leaderboard may be the 3rd response
        try {
          const lbRes = await fetch(`${API_ROOT}/api/dashboard/leaderboard`, { credentials: 'include' });
          if (lbRes.ok) setLeaderboard(await lbRes.json());
        } catch (err) { console.warn('Leaderboard fetch failed', err); }
        // fetch active battle
        try {
          const bRes = await fetch(`${API_ROOT}/api/skill/active`, { credentials: 'include' });
          if (bRes.ok) {
            const arr = await bRes.json();
            setActiveBattle(arr?.[0] || null);
          }
        } catch (err) { console.warn('Active battle fetch failed', err); }
        // fetch active flash prize
        try {
          const pRes = await fetch(`${API_ROOT}/api/flash/active`, { credentials: 'include' });
          if (pRes.ok) {
            const pj = await pRes.json();
            if (pj?.active) setActivePrize(pj.prize || null);
            else setActivePrize(null);
          }
        } catch (err) { console.warn('Active prize fetch failed', err); }
        // fetch my submissions
        try {
          const mRes = await fetch(`${API_ROOT}/api/skill/my-submissions`, { credentials: 'include' });
          if (mRes.ok) setMySubmissions(await mRes.json());
        } catch (err) { console.warn('My submissions fetch failed', err); }
        // fetch recent chat messages
        try {
          const cRes = await fetch(`${API_ROOT}/api/chat/recent`, { credentials: 'include' });
          if (cRes.ok) setMessages(await cRes.json());
        } catch (err) { console.warn('Chat recent fetch failed', err); }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // react to hash changes so Navbar mobile tabs can set the active tab
    const onHash = () => { if (window.location.hash) setActiveTab(window.location.hash.replace('#','')); };
    window.addEventListener('hashchange', onHash);

    // Setup socket.io for chat and battle events
    try {
      const endpoint = API_ROOT || window.location.origin;
      const socket = io(endpoint, { withCredentials: true });
      socketRef.current = socket;
      socket.on('connect', () => {
        console.log('socket connected', socket.id);
      });
      socket.on('chat:message', (msg: any) => {
        setMessages((s) => [...s, msg]);
      });
      socket.on('battle:accepted', (evt: any) => {
        toast.success(`Submission accepted: +${evt.points} pts`);
      });
      socket.on('chat:rate_limited', (info: any) => {
        const ms = info?.retryAfterMs || 0;
        toast.error(`You're sending messages too fast. Retry in ${Math.ceil(ms/1000)}s`);
      });
      socket.on('chat:unauthorized', (info: any) => {
        toast.error(info?.message || 'Chat unauthorized');
      });
      socket.on('chat:blocked', (info: any) => {
        toast.error(info?.reason ? `Message blocked: ${info.reason}` : 'Message blocked by server');
      });
    } catch (err) { console.warn('Socket init failed', err); }

    return () => { socketRef.current?.disconnect(); window.removeEventListener('hashchange', onHash); };
  }, []);

  // identify/join channel once we have profile info
  useEffect(() => {
    if (!socketRef.current || !dashboardData) return;
    try {
      const profile = dashboardData?.profile || {};
      socketRef.current.emit('identify', { userId: profile.userId || profile._id, name: profile.name });
      socketRef.current.emit('join:channel', 'general');
    } catch (e) { }
  }, [dashboardData]);

  const handleSubmitBattle = async () => {
    if (!activeBattle) return toast.error('No active battle');
    if (!submissionText) return toast.error('Enter your answer');
    setSubmitting(true);
    try {
      // get CSRF token
      const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
      const { csrfToken } = await tokenRes.json().catch(()=>({}));
      const res = await fetch(`${API_ROOT}/api/skill/${activeBattle._id}/submit`, { method: 'POST', credentials: 'include', headers: { 'Content-Type':'application/json', 'x-csrf-token': csrfToken || '' }, body: JSON.stringify({ answer: submissionText }) });
      const data = await res.json();
      if (res.ok) { toast.success(data.message || 'Submitted'); setSubmitted(true); }
      else toast.error(data.message || 'Submit failed');
    } catch (err) { toast.error('Submission error'); }
    finally { setSubmitting(false); }
  };

  function RedeemForm() {
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const handleRedeem = async () => {
      if (!code) return toast.error('Enter code');
      setBusy(true);
      try {
        const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
        const { csrfToken } = await tokenRes.json();
        const res = await fetch(`${API_ROOT}/api/transactions/redeem-code`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken || '' }, body: JSON.stringify({ code }) });
        const data = await res.json();
        if (res.ok) { toast.success(data.message || 'Redeemed'); window.location.reload(); }
        else toast.error(data.message || 'Redeem failed');
      } catch (err) { toast.error('Redeem error'); }
      finally { setBusy(false); }
    };
    return (
      <div className="space-y-3">
        <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter redeem code" className="w-full p-3 bg-black border border-border rounded" />
        <div className="flex gap-2">
          <button onClick={handleRedeem} disabled={busy} className="bg-primary text-black px-6 py-2 rounded">Redeem</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-primary">INITIALIZING_SECURE_WORKSPACE...</div>;

  const stats = [
    { label: "Course Enrolled", value: dashboardData?.course?.enrolled ?? 'No data', icon: <BookOpen />, sub: `Instructor: ${dashboardData?.course?.instructor ?? 'TBD'}` },
    { label: "Lessons Covered", value: dashboardData?.course ? `${dashboardData.course.covered ?? 0} / ${dashboardData.course.total ?? 0}` : 'No data', icon: <History />, sub: dashboardData?.course ? `${Math.floor(((dashboardData.course.covered||0)/(dashboardData.course.total||1))*100)}% Complete` : 'N/A' },
    { label: "Learning Package", value: dashboardData?.profile?.package || "BASIC", icon: <Zap className={dashboardData?.profile?.package === 'PREMIUM' ? 'text-primary' : ''} />, sub: dashboardData?.profile?.package === 'BASIC' ? "Upgrade for full access" : "Active Premium" },
    { label: "Total Skill Points", value: dashboardData?.profile?.points ?? 0, icon: <Trophy className="text-primary" />, sub: "Weekly leaderboard" },
  ];

  // normalize package display
  const accountPackage = String(dashboardData?.profile?.package || 'BASIC').toUpperCase();

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 pt-24 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Flash Prize Banner */}
        <AnimatePresence>
          {prizeActive && (
            <AnimatePresence>
              {activePrize && (
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
                      <span className="text-lg">{activePrize.title}</span>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json().catch(()=>({}));
                        const res = await fetch(`${API_ROOT}/api/flash/${activePrize.id}/claim`, { method: 'POST', credentials: 'include', headers: { 'x-csrf-token': csrfToken || '' } });
                        const data = await res.json();
                        if (res.ok) { toast.success(data.message || 'Prize claimed'); setActivePrize(null); }
                        else toast.error(data.message || 'Claim failed');
                      } catch (err) { toast.error('Claim error'); }
                    }}
                    className="bg-black text-white px-6 py-2 rounded border border-black/10 hover:bg-black/80 transition-all text-xs font-mono uppercase tracking-widest relative z-10"
                  >
                    CLAIM
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
              <div className={`bg-primary/10 border border-primary text-primary px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase mt-4 ${accountPackage === 'PREMIUM' ? 'opacity-100' : 'opacity-60'}`}>
                {accountPackage}
              </div>
            {dashboardData?.profile?.package === 'BASIC' && (
              <div className="technical-card max-w-md mt-4">
                <h4 className="text-[11px] text-text-dim uppercase tracking-widest mb-2">Redeem Manual Payment Code</h4>
                <RedeemForm />
              </div>
            )}
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
                      {activeBattle ? (
                        <span className="text-red-500 font-mono text-[14px]">{(() => {
                          const now = new Date();
                          const exp = new Date(activeBattle.expireAt);
                          const diff = Math.max(0, Math.floor((exp.getTime()-now.getTime())/1000));
                          const hh = String(Math.floor(diff/3600)).padStart(2,'0');
                          const mm = String(Math.floor((diff%3600)/60)).padStart(2,'0');
                          const ss = String(diff%60).padStart(2,'0');
                          return `${hh}:${mm}:${ss} REMAINING`;
                        })()}</span>
                      ) : null}
                    </h2>
                    <h3 className="text-xl font-medium tracking-tight">{activeBattle ? activeBattle.title : 'No active skill battles'}</h3>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-text-dim mb-8">
                  {activeBattle ? (activeBattle.question || 'Task details not available.') : 'No active battles at the moment — take part in LMS actions to grow your data and await upcoming battles.'}
                </p>

                <div className="space-y-4">
                  {activeBattle ? (
                    <>
                      <textarea
                        value={submissionText}
                        onChange={(e)=>setSubmissionText(e.target.value)}
                        className="w-full bg-black/50 border border-border rounded p-6 focus:border-primary focus:outline-none transition-all text-white text-sm font-mono"
                        rows={8}
                        placeholder="Paste your answer or write your steps here..."
                        disabled={submitted}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSubmitBattle} disabled={submitting || submitted} className="bg-primary text-black font-mono text-xs font-bold px-6 py-3 rounded hover:bg-primary-dark transition-all">
                          {submitted ? 'SUBMITTED' : (submitting ? 'SUBMITTING...' : 'SUBMIT ANSWER')}
                        </button>
                        <button onClick={() => { setSubmissionText(''); }} className="px-4 py-3 border border-border rounded text-sm">Clear</button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-text-dim bg-black/20 rounded">No active skill battles at the moment.</div>
                  )}
                </div>

                {/* My submissions */}
                <div className="mt-6 bg-black/40 border border-border rounded p-4">
                  <h4 className="text-xs text-text-dim uppercase tracking-widest mb-3">My Submissions</h4>
                  {mySubmissions.length === 0 && <div className="text-text-dim">No submissions yet.</div>}
                  {mySubmissions.map(s => (
                    <div key={s._id} className="mb-3 p-3 bg-black/20 rounded">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold">{s.battle?.title || 'Battle'}</div>
                        <div className="text-[11px] font-mono text-text-dim">{new Date(s.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-[13px] text-gray-300 mt-2 whitespace-pre-wrap">{String(s.answer).slice(0,1000)}</div>
                      <div className="text-[11px] mt-2">
                        Status: <span className={`font-bold ${s.status==='accepted'?'text-green-400': s.status==='rejected'?'text-red-400':'text-text-dim'}`}>{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="technical-card">
                <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest mb-6">Leaderboard (Weekly)</h3>
                <div className="space-y-0 divide-y divide-border">
                    {leaderboard.length > 0 ? (
                      leaderboard.slice(0,4).map((p: any) => (
                        <div key={p.userId} className="flex items-center justify-between py-3 transition-colors hover:bg-white/5">
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-primary text-xs">{String(p.rank).padStart(2,'0')}</span>
                            <span className={`text-[13px] ${p.userId === dashboardData?.profile?.userId ? 'font-bold text-white' : 'text-gray-400'}`}>{p.name}</span>
                          </div>
                          <span className="text-text-dim font-mono text-[12px]">{p.points} pts</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-text-dim">No leaderboard data this week.</div>
                    )}
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
                  {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.user === dashboardData?.profile?.name ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {m.user !== dashboardData?.profile?.name && <span className="text-[10px] font-bold text-primary uppercase">{m.user}</span>}
                        <span className="text-[9px] text-text-dim font-mono">{new Date(m.time).toLocaleTimeString()}</span>
                      </div>
                      <div className={`p-3 rounded-lg text-sm ${m.user === dashboardData?.profile?.name ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-none' : 'bg-white/5 border border-border text-gray-300 rounded-tl-none'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border">
                  <div className="relative flex gap-2">
                    <input value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} type="text" placeholder="TRANSMIT_MESSAGE..." className="flex-grow bg-black border border-border rounded p-3 text-xs font-mono focus:border-primary focus:outline-none" />
                    <button onClick={async () => {
                      const text = newMessage.trim();
                      if (!text) return toast.error('Enter a message');
                      const socket = socketRef.current;
                      if (!socket || !socket.connected) return toast.error('Chat disconnected');
                      const payload = { user: dashboardData?.profile?.name || 'Anonymous', text, time: new Date().toISOString() };
                      // use acknowledgement to confirm server received/persisted
                      socket.emit('chat:message', payload, (ack: any) => {
                        if (ack && ack.ok) {
                          setMessages(prev => [...prev, ack.message || payload]);
                          setNewMessage('');
                        } else {
                          toast.error((ack && ack.error) || 'Message failed to send');
                        }
                      });
                    }} className="text-primary px-3 py-2 bg-primary/5 rounded">Send</button>
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
                    {leaderboard.length > 0 ? (
                      leaderboard.map((p: any, i: number) => (
                        <tr key={p.userId} className={`hover:bg-white/5 transition-all ${p.userId === dashboardData?.profile?.userId ? 'bg-primary/5' : ''}`}>
                          <td className="p-6 font-mono text-primary text-xl font-bold">#{p.rank}</td>
                          <td className="p-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">{p.name?.[0] || '?'}</div>
                            <span className={p.userId === dashboardData?.profile?.userId ? 'font-bold text-white' : 'text-gray-300'}>{p.name}{p.userId === dashboardData?.profile?.userId && ' (YOU)'}</span>
                          </td>
                          <td className="p-6">
                            <div className="flex gap-1">
                              {/* placeholder badges based on points */}
                              {Array.from({ length: Math.min(3, Math.floor((p.points || 0) / 1000)) }).map((_, j) => (
                                <div key={j} className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,184,81,0.4)]">
                                  <Trophy className="w-2 h-2 text-black" />
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-6 font-mono text-xl">{(p.points || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="p-6 text-text-dim">No leaderboard data available.</td></tr>
                    )}
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
