import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_ROOT } from "../../config";
import { 
  Users, BookOpen, Trophy, CreditCard, Plus, 
  Settings, Search, ArrowUpRight, Check, X,
  LayoutDashboard, List, Gift, Calendar, FileText,
  MessageSquare
} from "lucide-react";
import LessonUnits from "../../components/Dashboard/LessonUnits.tsx";
import toast from 'react-hot-toast';
import CodeModal from '../../components/CodeModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import PromptModal from '../../components/PromptModal';
import LoadingBreadcrumb from '../../components/LoadingBreadcrumb';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [showNewEntityModal, setShowNewEntityModal] = useState(false);
  const [newEntityType, setNewEntityType] = useState('flash');
  const [newPrizeTitle, setNewPrizeTitle] = useState('');
  const [newPrizeCode, setNewPrizeCode] = useState('');
  const [newPrizeRevealAt, setNewPrizeRevealAt] = useState('');
  const [newPrizeExpiry, setNewPrizeExpiry] = useState(3600);
  const [newPrizeSingleWinner, setNewPrizeSingleWinner] = useState(true);
  const [manualEmail, setManualEmail] = useState('');
  const [manualAmount, setManualAmount] = useState(250);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch(`${API_ROOT}/api/dashboard/admin/summary`, { credentials: 'include' });
        if (res.ok) {
          setData(await res.json());
        }
        const pRes = await fetch(`${API_ROOT}/api/transactions/manual/pending`, { credentials: 'include' });
        if (pRes.ok) setPendingPayments(await pRes.json());
        const uRes = await fetch(`${API_ROOT}/api/users`, { credentials: 'include' });
        if (uRes.ok) setUsers(await uRes.json());
        // fetch recent submissions
          try {
            const sRes = await fetch(`${API_ROOT}/api/skills/submissions`, { credentials: 'include' });
          if (sRes.ok) setBattleSubmissions(await sRes.json());
        } catch (err) { console.warn('Failed fetching submissions', err); }
      } catch (err) {
        console.error("Admin data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);
  const [battleSubmissions, setBattleSubmissions] = useState<any[]>([]);
  const [processingTxId, setProcessingTxId] = useState<string | null>(null);
  const [creatingManual, setCreatingManual] = useState(false);
  const [creatingBattle, setCreatingBattle] = useState(false);
  const [creatingPrize, setCreatingPrize] = useState(false);
  const [togglingAccessId, setTogglingAccessId] = useState<string | null>(null);
  const [showCreateBattle, setShowCreateBattle] = useState(false);
  const [newBattle, setNewBattle] = useState({ title: '', question: '', startAt: '', expireAt: '', points: 10 });
  const [showCodeModal, setShowCodeModal] = useState<{ open: boolean; code?: string }>({ open: false });
  const [chatRecent, setChatRecent] = useState<any[]>([]);
  const [chatFlagged, setChatFlagged] = useState<any[]>([]);
  const [confirmState, setConfirmState] = useState<any>({ open: false, title: '', message: '', onConfirm: null, confirmLabel: 'Confirm' });
  const [promptState, setPromptState] = useState<any>({ open: false, title: '', placeholder: '', initial: '', onConfirm: null });

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-primary uppercase tracking-[0.3em]">Accessing_Admin_Core_Node...</div>;

  const stats = data?.stats || [];

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border p-8 space-y-8 hidden lg:flex flex-col pt-24">
        <div className="space-y-2">
          <h4 className="text-[10px] text-text-dim uppercase tracking-[0.3em] font-bold mb-6">Control Center</h4>
          {[
            { id: "overview", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "lessons", label: "Lessons", icon: <FileText className="w-4 h-4" /> },
            { id: "students", label: "Students", icon: <Users className="w-4 h-4" /> },
            { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
            { id: "skill-battle", label: "Skill Battle", icon: <Trophy className="w-4 h-4" /> },
            { id: "chat", label: "Messenger", icon: <MessageSquare className="w-4 h-4" /> },
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
      {/* Skill Battle View */}
      {activeView === 'skill-battle' && (
        <div className="technical-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest">Skill Battles</h3>
            <button onClick={() => setShowCreateBattle(true)} className="bg-primary/5 text-primary px-4 py-2 rounded text-xs font-bold">New Battle</button>
          </div>
          {showCreateBattle && (
            <div className="border border-border p-4 mb-4 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={newBattle.title} onChange={(e)=>setNewBattle({...newBattle, title:e.target.value})} placeholder="Title" className="p-3 bg-black border border-border rounded" />
                <input value={newBattle.points} onChange={(e)=>setNewBattle({...newBattle, points: parseInt(e.target.value||'0')})} placeholder="Points" type="number" className="p-3 bg-black border border-border rounded" />
                <input value={newBattle.startAt} onChange={(e)=>setNewBattle({...newBattle, startAt:e.target.value})} placeholder="StartAt (ISO)" className="p-3 bg-black border border-border rounded" />
                <input value={newBattle.expireAt} onChange={(e)=>setNewBattle({...newBattle, expireAt:e.target.value})} placeholder="ExpireAt (ISO)" className="p-3 bg-black border border-border rounded" />
              </div>
              <textarea value={newBattle.question} onChange={(e)=>setNewBattle({...newBattle, question:e.target.value})} placeholder="Question / Task" className="w-full p-3 bg-black border border-border rounded mt-3" />
              <div className="flex gap-2 justify-end mt-3">
                <button onClick={() => setShowCreateBattle(false)} className="px-4 py-2 border border-border rounded">Cancel</button>
                <button onClick={async () => {
                  if (!newBattle.title || !newBattle.question) return toast.error('Title and question required');
                  setCreatingBattle(true);
                  try {
                    const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json().catch(()=>({}));
                    const res = await fetch(`${API_ROOT}/api/skills`, { method: 'POST', credentials: 'include', headers: { 'Content-Type':'application/json','x-csrf-token': csrfToken || '' }, body: JSON.stringify(newBattle) });
                    if (!res.ok) { const err = await res.json().catch(()=>({message:'Failed'})); throw new Error(err.message||'Failed'); }
                    const created = await res.json();
                    toast.success('Skill battle created');
                    setShowCreateBattle(false);
                    setNewBattle({ title:'', question:'', startAt:'', expireAt:'', points:10 });
                  } catch (err:any) { console.error(err); toast.error(err.message||'Create failed'); }
                  finally { setCreatingBattle(false); }
                }} disabled={creatingBattle} className="px-4 py-2 rounded bg-primary text-black font-bold disabled:opacity-60">
                  {creatingBattle ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs text-text-dim uppercase mb-3">Recent Submissions</h4>
            {battleSubmissions.length === 0 ? (
              <div className="text-text-dim">No submissions yet.</div>
            ) : (
              battleSubmissions.map((s:any)=> (
                <div key={s._id} className="p-3 bg-black/20 rounded mb-2">
                  <div className="flex justify-between">
                    <div className="font-bold">{s.battle?.title || 'Battle'}</div>
                    <div className="text-text-dim text-xs">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm mt-2">{String(s.answer).slice(0,200)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 lg:hidden">
          <div className="w-64 bg-[#050505] h-full p-6 border-r border-border">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] text-text-dim uppercase tracking-[0.3em] font-bold">Control Center</h4>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 border border-border rounded">Close</button>
            </div>
            {[
              { id: "overview", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: "lessons", label: "Lessons", icon: <FileText className="w-4 h-4" /> },
              { id: "students", label: "Students", icon: <Users className="w-4 h-4" /> },
              { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
              { id: "skill-battle", label: "Skill Battle", icon: <Trophy className="w-4 h-4" /> },
              { id: "chat", label: "Messenger", icon: <MessageSquare className="w-4 h-4" /> },
              { id: "prizes", label: "Rewards", icon: <Gift className="w-4 h-4" /> },
              { id: "sessions", label: "Schedule", icon: <Calendar className="w-4 h-4" /> },
            ].map((item) => (
              <button key={item.id} onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-0 py-3 text-xs font-bold transition-all uppercase tracking-widest ${activeView === item.id ? "text-primary" : "text-text-dim hover:text-white"}`}>
                <span className="w-6">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New Entity Modal */}
      {showNewEntityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg bg-[#050505] border border-border p-6 rounded">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold">Create New Entity</h4>
              <button onClick={() => setShowNewEntityModal(false)} className="p-2 border border-border rounded">Close</button>
            </div>
              <div className="space-y-4">
              <div>
                <label className="text-xs text-text-dim uppercase">Type</label>
                <select value={newEntityType} onChange={(e)=>setNewEntityType(e.target.value)} className="w-full p-3 bg-black border border-border rounded mt-1">
                  <option value="flash">Flash Prize</option>
                  <option value="announcement">Announcement</option>
                  <option value="session">Session</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-text-dim uppercase">Title</label>
                <input value={newPrizeTitle} onChange={(e)=>setNewPrizeTitle(e.target.value)} className="w-full p-3 bg-black border border-border rounded mt-1" />
              </div>

              <div>
                <label className="text-xs text-text-dim uppercase">Code (optional)</label>
                <input value={newPrizeCode} onChange={(e)=>setNewPrizeCode(e.target.value)} className="w-full p-3 bg-black border border-border rounded mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-text-dim uppercase">Reveal At (ISO)</label>
                  <input value={newPrizeRevealAt} onChange={(e)=>setNewPrizeRevealAt(e.target.value)} placeholder="2026-05-03T17:00:00Z" className="w-full p-3 bg-black border border-border rounded mt-1" />
                </div>
                <div>
                  <label className="text-xs text-text-dim uppercase">Expiry Seconds</label>
                  <input type="number" value={newPrizeExpiry} onChange={(e)=>setNewPrizeExpiry(parseInt(e.target.value||'0'))} className="w-full p-3 bg-black border border-border rounded mt-1" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input id="singleWinner" type="checkbox" checked={newPrizeSingleWinner} onChange={(e)=>setNewPrizeSingleWinner(e.target.checked)} />
                <label htmlFor="singleWinner" className="text-xs text-text-dim uppercase">Single Winner</label>
              </div>

              <div className="flex justify-end">
                <button onClick={async ()=>{
                  if (!newPrizeTitle) return toast.error('Title required');
                  setCreatingPrize(true);
                  try {
                    const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
                    const { csrfToken } = await tokenRes.json();
                        const body = { title: newPrizeTitle, code: newPrizeCode || undefined, revealAt: newPrizeRevealAt || new Date().toISOString(), expirySeconds: newPrizeExpiry, singleWinner: newPrizeSingleWinner };
                        let res;
                        if (newEntityType === 'flash') {
                          res = await fetch(`${API_ROOT}/api/flash`, { method: 'POST', credentials: 'include', headers: { 'Content-Type':'application/json', 'x-csrf-token': csrfToken||'' }, body: JSON.stringify(body) });
                        } else {
                          // Placeholder for other entity types
                          toast('Entity type not implemented yet', { icon: 'ℹ️' });
                          setShowNewEntityModal(false);
                          return;
                        }
                    if (!res.ok) { const err = await res.json().catch(()=>({message:'Failed'})); return toast.error(err.message||'Failed'); }
                    const prize = await res.json();
                    toast.success('Flash prize created');
                    setShowNewEntityModal(false);
                    setNewPrizeTitle(''); setNewPrizeCode(''); setNewPrizeRevealAt(''); setNewPrizeExpiry(3600);
                  } catch (err) { console.error(err); toast.error('Request failed'); }
                  finally { setCreatingPrize(false); }
                }} disabled={creatingPrize} className="bg-primary px-6 py-2 rounded font-bold text-black disabled:opacity-60">
                  {creatingPrize ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-grow p-4 md:p-8 pt-16 md:pt-24 space-y-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-normal tracking-tight">Admin Workspace</h1>
            <div className="font-mono text-[11px] text-text-dim uppercase mt-1">Status: Global Commander • Node: DVX-ROOT</div>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 border border-border rounded hover:bg-white/5">
              <List className="w-5 h-5" />
            </button>
            <button onClick={() => setShowNewEntityModal(true)} className="hidden md:inline-flex bg-primary/5 text-primary border border-primary/20 px-6 py-2 rounded text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-black transition-all">
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
                {pendingPayments.length === 0 && <div className="p-6 text-text-dim">No pending manual payments.</div>}
                {pendingPayments.map((p: any) => {
                  const isProcessing = processingTxId === p._id;
                  return (
                  <div key={p._id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-[13px] font-medium text-white">{p.user?.name || p.user?.email || 'Unknown'}</p>
                      <p className="font-mono text-[10px] text-text-dim uppercase mt-1">MANUAL • {p.amount} {p.currency}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmState({ open: true, title: 'Mark Paid', message: 'Mark this manual payment as paid and generate redeem code?', onConfirm: async () => {
                        setConfirmState((s:any)=>({ ...s, open:false }));
                        setProcessingTxId(p._id);
                        try {
                          const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json().catch(()=>({}));
                          const res = await fetch(`${API_ROOT}/api/transactions/manual/mark-paid/${p._id}`, { method: 'POST', credentials: 'include', headers: { 'x-csrf-token': csrfToken || '' } });
                          const data = await res.json();
                          if (res.ok) { 
                            toast.success('Marked paid');
                            setPendingPayments(prev => prev.filter(x => x._id !== p._id));
                            setShowCodeModal({ open: true, code: data.code });
                          } else toast.error(data.message || 'Failed');
                        } catch (err) { console.error(err); toast.error('Failed'); }
                        finally { setProcessingTxId(null); }
                      }, confirmLabel: 'Mark Paid' })} disabled={isProcessing} className="p-2 border border-border rounded hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-60">
                        {isProcessing ? <LoadingBreadcrumb text="Processing..." /> : <Check className="w-3 h-3" />}
                      </button>
                      <button onClick={() => setConfirmState({ open: true, title: 'Reject Payment', message: 'Reject and remove this pending payment?', onConfirm: async () => {
                        setConfirmState((s:any)=>({ ...s, open:false }));
                        setProcessingTxId(p._id);
                        const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json();
                        const res = await fetch(`${API_ROOT}/api/transactions/${p._id}`, { method: 'DELETE', credentials: 'include', headers: { 'x-csrf-token': csrfToken || '' } });
                        if (res.ok) { toast.success('Removed'); setPendingPayments(prev => prev.filter(x => x._id !== p._id)); }
                        else toast.error('Failed');
                        setProcessingTxId(null);
                      }, confirmLabel: 'Reject' })} disabled={isProcessing} className="p-2 border border-border rounded hover:bg-red-500/10 hover:text-red-500 transition-all disabled:opacity-60">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="technical-card">
              <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest mb-6">Create Manual Payment</h3>
              <div className="space-y-4">
                <select value={selectedUserId} onChange={(e)=>setSelectedUserId(e.target.value)} className="w-full p-3 bg-black border border-border rounded">
                  <option value="">Select user</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} • {u.email}</option>
                  ))}
                </select>
                <input value={manualAmount} onChange={(e)=>setManualAmount(parseFloat(e.target.value))} type="number" className="w-full p-3 bg-black border border-border rounded" />
                <div className="flex gap-2">
                  <button onClick={async ()=>{
                    if (!selectedUserId) return toast.error('Select a user');
                    setCreatingManual(true);
                    try {
                      const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json();
                      const res = await fetch(`${API_ROOT}/api/transactions/manual/create/${selectedUserId}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type':'application/json', 'x-csrf-token': csrfToken||'' }, body: JSON.stringify({ amount: manualAmount }) });
                      if (res.ok) { toast.success('Transaction created'); const tx = await res.json(); setPendingPayments(prev=>[tx,...prev]); setSelectedUserId(''); }
                      else { const err = await res.json(); toast.error(err.message||'Failed'); }
                    } finally {
                      setCreatingManual(false);
                    }
                  }} disabled={creatingManual} className="bg-primary text-black px-6 py-2 rounded disabled:opacity-60">
                    {creatingManual ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>

            <div className="technical-card">
              <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest mb-6">Battle Submissions</h3>
              <div className="space-y-0 divide-y divide-border">
                {battleSubmissions.length === 0 && <div className="p-6 text-text-dim">No recent submissions.</div>}
                {battleSubmissions.map((s: any) => (
                  <div key={s._id} className="py-4 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-medium text-white">{s.user?.name || s.user?.email || 'Unknown'}</p>
                        <p className="font-mono text-[10px] text-text-dim uppercase mt-1">{s.battle?.title || 'Unknown Battle'} • {new Date(s.createdAt).toLocaleString()}</p>
                        <p className="text-sm mt-2 text-gray-300 max-w-xl whitespace-pre-wrap">{String(s.answer).slice(0, 800)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmState({ open: true, title: 'Accept Submission', message: 'Accept this submission and award points?', onConfirm: async () => {
                          setConfirmState((s:any)=>({ ...s, open:false }));
                          try {
                            const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json().catch(()=>({}));
                            const res = await fetch(`${API_ROOT}/api/skills/${s.battle._id}/submissions/${s._id}/evaluate`, { method: 'POST', credentials: 'include', headers: { 'Content-Type':'application/json', 'x-csrf-token': csrfToken || '' }, body: JSON.stringify({ action: 'accept' }) });
                            const data = await res.json();
                            if (res.ok) { toast.success(data.message || 'Accepted'); setBattleSubmissions(prev=>prev.filter(x=>x._id!==s._id)); }
                            else { toast.error(data.message || 'Failed'); }
                          } catch (err) { console.error(err); toast.error('Request failed'); }
                        }, confirmLabel: 'Accept' })} className="p-2 border border-border rounded hover:bg-primary/10">Accept</button>

                        <button onClick={() => setConfirmState({ open: true, title: 'Reject Submission', message: 'Reject this submission?', onConfirm: async () => {
                          setConfirmState((s:any)=>({ ...s, open:false }));
                          try {
                            const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json().catch(()=>({}));
                            const res = await fetch(`${API_ROOT}/api/skills/${s.battle._id}/submissions/${s._id}/evaluate`, { method: 'POST', credentials: 'include', headers: { 'Content-Type':'application/json', 'x-csrf-token': csrfToken || '' }, body: JSON.stringify({ action: 'reject' }) });
                            const data = await res.json();
                            if (res.ok) { toast.success(data.message || 'Rejected'); setBattleSubmissions(prev=>prev.filter(x=>x._id!==s._id)); }
                            else { toast.error(data.message || 'Failed'); }
                          } catch (err) { console.error(err); toast.error('Request failed'); }
                        }, confirmLabel: 'Reject' })} className="p-2 border border-border rounded hover:bg-red-500/10">Reject</button>

                        <ArrowUpRight className="w-3 h-3 text-text-dim" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === "lessons" && (
          <div className="max-w-4xl">
            <LessonUnits isAdmin={true} />
          </div>
        )}

        {activeView === "students" && (
          <div className="technical-card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-text-dim uppercase text-[10px] tracking-[0.2em] border-b border-border">
                <tr>
                  <th className="pb-4">Operator</th>
                  <th className="pb-4">ID</th>
                  <th className="pb-4">Package</th>
                  <th className="pb-4">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u, i) => (
                  <tr key={u._id || i} className="hover:bg-white/5">
                    <td className="py-4 font-bold">{u.name || u.email}</td>
                    <td className="py-4 font-mono text-xs">{u._id}</td>
                    <td className="py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/20 text-primary rounded">{(u.package||'BASIC').toUpperCase()}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase ${u.access ? 'text-primary' : 'text-red-400'}`}>{u.access ? 'Active' : 'Revoked'}</span>
                        <button onClick={() => setConfirmState({ open: true, title: u.access ? 'Revoke Access' : 'Restore Access', message: u.access ? 'Revoke access for this user?' : 'Restore access for this user?', onConfirm: async () => {
                          setConfirmState((s:any)=>({ ...s, open:false }));
                          try {
                            setTogglingAccessId(u._id);
                            const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json();
                            const res = await fetch(`${API_ROOT}/api/users/${u._id}/access`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type':'application/json', 'x-csrf-token': csrfToken||'' }, body: JSON.stringify({ access: !u.access }) });
                            if (!res.ok) { const err = await res.json().catch(()=>({message:'Failed'})); return toast.error(err.message || 'Failed'); }
                            const updated = await res.json();
                            setUsers(prev => prev.map(x => x._id === updated._id ? updated : x));
                            toast.success(updated.access ? 'Access restored' : 'Access revoked');
                          } catch (err) { console.error(err); toast.error('Request failed'); }
                          finally { setTogglingAccessId(null); }
                        }, confirmLabel: u.access ? 'Revoke' : 'Restore' })} disabled={togglingAccessId === u._id} className="text-[10px] font-bold uppercase text-primary hover:underline disabled:opacity-60">{u.access ? 'Revoke' : 'Restore'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeView === "prizes" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="technical-card bg-primary/10 border-primary">
              <h4 className="text-primary font-bold mb-2 uppercase text-xs tracking-widest">Active Flash Prize</h4>
              <p className="text-2xl font-bold mb-4">5GB DATA COUPON</p>
              <button className="w-full bg-primary text-black font-bold py-2 rounded text-[10px] uppercase tracking-widest">DEPLOY NEW PRIZE</button>
            </div>
            <div className="technical-card border-dashed">
              <button onClick={()=>setShowNewEntityModal(true)} className="w-full h-full flex flex-col items-center justify-center gap-3 text-text-dim hover:text-white transition-all">
                <Plus className="w-8 h-8" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Queue Reward</span>
              </button>
            </div>
          </div>
        )}

        {activeView === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="technical-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest">Recent Messages</h3>
                <div className="flex items-center gap-2">
                  <button onClick={async ()=>{
                    try {
                      const res = await fetch(`${API_ROOT}/api/chat/recent`, { credentials: 'include' });
                      if (res.ok) setChatRecent(await res.json());
                    } catch (e) { console.warn(e); }
                  }} className="text-xs p-2 border border-border rounded">Refresh</button>
                </div>
              </div>
              <div className="space-y-3">
                {chatRecent.length === 0 && <div className="text-text-dim p-4">No recent messages.</div>}
                {chatRecent.map(m => (
                  <div key={m._id} className="p-3 bg-black/20 rounded border border-border flex items-start justify-between">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-bold text-sm">{m.user || 'Anonymous'}</div>
                        <div className="text-[10px] text-text-dim font-mono">{new Date(m.time || m.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-gray-300 whitespace-pre-wrap">{m.text}</div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button onClick={() => setPromptState({ open: true, title: 'Flag Message', placeholder: 'Reason (optional)', initial: '', onConfirm: async (reason: string) => {
                        setPromptState((s:any)=>({ ...s, open:false }));
                        try {
                          const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
                          const { csrfToken } = await tokenRes.json().catch(()=>({}));
                          const res = await fetch(`${API_ROOT}/api/chat/${m._id}/flag`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type':'application/json', 'x-csrf-token': csrfToken||'' }, body: JSON.stringify({ reason }) });
                          if (res.ok) {
                            const updated = await res.json();
                            setChatFlagged(prev => [updated, ...prev]);
                            setChatRecent(prev => prev.filter(x=>x._id !== m._id));
                            toast.success('Message flagged');
                          } else { const err = await res.json().catch(()=>({})); toast.error(err.message||'Failed'); }
                        } catch (e) { console.error(e); toast.error('Failed'); }
                      } })} className="text-xs p-2 border border-border rounded">Flag</button>

                      <button onClick={() => setConfirmState({ open: true, title: 'Delete Message', message: 'Delete this message?', onConfirm: async () => {
                        setConfirmState((s:any)=>({ ...s, open:false }));
                        try {
                          const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
                          const { csrfToken } = await tokenRes.json().catch(()=>({}));
                          const res = await fetch(`${API_ROOT}/api/chat/${m._id}`, { method: 'DELETE', credentials: 'include', headers: { 'x-csrf-token': csrfToken||'' } });
                          if (res.ok) {
                            setChatRecent(prev => prev.filter(x=>x._id !== m._id));
                            setChatFlagged(prev => prev.filter(x=>x._id !== m._id));
                            toast.success('Deleted');
                          } else { const err = await res.json().catch(()=>({})); toast.error(err.message||'Failed'); }
                        } catch (e) { console.error(e); toast.error('Failed'); }
                      }, confirmLabel: 'Delete' })} className="text-xs p-2 border border-border rounded hover:bg-red-500/10">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="technical-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest">Flagged Messages</h3>
                <div>
                  <button onClick={async ()=>{
                    try {
                      const res = await fetch(`${API_ROOT}/api/chat/flagged`, { credentials: 'include' });
                      if (res.ok) setChatFlagged(await res.json());
                    } catch (e) { console.warn(e); }
                  }} className="text-xs p-2 border border-border rounded">Refresh</button>
                </div>
              </div>
              <div className="space-y-3">
                {chatFlagged.length === 0 && <div className="text-text-dim p-4">No flagged messages.</div>}
                {chatFlagged.map(m => (
                  <div key={m._id} className="p-3 bg-black/20 rounded border border-border flex items-start justify-between">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-bold text-sm">{m.user || 'Anonymous'}</div>
                        <div className="text-[10px] text-text-dim font-mono">{new Date(m.time || m.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-gray-300 whitespace-pre-wrap">{m.text}</div>
                      <div className="text-[10px] text-text-dim mt-2">Reason: {m.flaggedReason || '—'}</div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button onClick={() => setConfirmState({ open: true, title: 'Unflag Message', message: 'Unflag this message?', onConfirm: async () => {
                        setConfirmState((s:any)=>({ ...s, open:false }));
                        setChatFlagged(prev => prev.filter(x=>x._id !== m._id));
                        toast('Unflagged locally');
                      }, confirmLabel: 'Unflag' })} className="text-xs p-2 border border-border rounded">Unflag</button>
                      <button onClick={() => setConfirmState({ open: true, title: 'Delete Flagged Message', message: 'Delete this flagged message?', onConfirm: async () => {
                        setConfirmState((s:any)=>({ ...s, open:false }));
                        try {
                          const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
                          const { csrfToken } = await tokenRes.json().catch(()=>({}));
                          const res = await fetch(`${API_ROOT}/api/chat/${m._id}`, { method: 'DELETE', credentials: 'include', headers: { 'x-csrf-token': csrfToken||'' } });
                          if (res.ok) { setChatFlagged(prev => prev.filter(x=>x._id !== m._id)); toast.success('Deleted'); }
                          else { const err = await res.json().catch(()=>({})); toast.error(err.message||'Failed'); }
                        } catch (e) { console.error(e); toast.error('Failed'); }
                      }, confirmLabel: 'Delete' })} className="text-xs p-2 border border-border rounded hover:bg-red-500/10">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === "sessions" && (
          <div className="technical-card">
            <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest mb-6">Upcoming Syncs</h3>
            <div className="space-y-4">
              {[
                { date: "May 01", title: "Advanced Linux Mastery", venue: "Lab 4", mentor: "Dave" },
                { date: "May 05", title: "Cloud Architecture", venue: "Zoom 01", mentor: "Sarah" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/40 border border-border rounded-lg gap-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[60px]">
                      <span className="text-xs text-text-dim block uppercase font-mono">{s.date.split(' ')[0]}</span>
                      <span className="text-xl font-bold">{s.date.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{s.title}</h4>
                      <p className="text-[10px] text-text-dim uppercase font-mono">{s.venue} • Mentor: {s.mentor}</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest font-mono">Reschedule</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === "payments" && (
          <div className="technical-card">
            <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-widest mb-6">Payment Verification Terminal</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-text-dim uppercase text-[10px] tracking-widest border-b border-border">
                  <tr>
                    <th className="pb-4 pt-2">Learner</th>
                    <th className="pb-4 pt-2">Ref ID</th>
                    <th className="pb-4 pt-2">Amount</th>
                    <th className="pb-4 pt-2">Method</th>
                    <th className="pb-4 pt-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingPayments.length > 0 ? (
                    pendingPayments.map((p: any) => {
                      const isProcessing = processingTxId === p._id;
                      return (
                      <tr key={p._id} className="hover:bg-white/5">
                        <td className="py-4 font-bold">{p.user?.name || p.user?.email || 'Unknown'}</td>
                        <td className="py-4 font-mono text-xs">{p._id}</td>
                        <td className="py-4 font-mono">{p.amount} {p.currency}</td>
                        <td className="py-4 text-[10px] font-bold">{p.provider || 'MANUAL'}</td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button onClick={async () => {
                              setProcessingTxId(p._id);
                              try {
                                const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json();
                                const res = await fetch(`${API_ROOT}/api/transactions/manual/mark-paid/${p._id}`, { method: 'POST', credentials: 'include', headers: { 'x-csrf-token': csrfToken || '' } });
                                if (!res.ok) return toast.error('Verify failed');
                                toast.success('Marked paid');
                                setPendingPayments(prev => prev.filter(x => x._id !== p._id));
                              } catch (err) { console.error(err); toast.error('Request failed'); }
                              finally { setProcessingTxId(null); }
                            }} disabled={isProcessing} className="text-[10px] font-bold uppercase text-primary hover:underline disabled:opacity-60">
                              {isProcessing ? <LoadingBreadcrumb text="Verifying..." /> : 'Verify'}
                            </button>
                            <button onClick={() => setConfirmState({ open: true, title: 'Flag Transaction', message: 'Flag and remove this transaction?', onConfirm: async () => {
                              setConfirmState((s:any)=>({ ...s, open:false }));
                              setProcessingTxId(p._id);
                              try {
                                const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' }); const { csrfToken } = await tokenRes.json();
                                const res = await fetch(`${API_ROOT}/api/transactions/${p._id}`, { method: 'DELETE', credentials: 'include', headers: { 'x-csrf-token': csrfToken || '' } });
                                if (!res.ok) return toast.error('Flag failed');
                                toast.success('Flagged/removed');
                                setPendingPayments(prev => prev.filter(x => x._id !== p._id));
                              } catch (err) { console.error(err); toast.error('Request failed'); }
                              finally { setProcessingTxId(null); }
                            }, confirmLabel: 'Flag' })} disabled={isProcessing} className="text-[10px] font-bold uppercase text-red-500 hover:underline disabled:opacity-60">Flag</button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-text-dim">No pending manual payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === "chat" && (
          <div className="technical-card h-[500px] flex flex-col p-0 overflow-hidden">
            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              <div className="text-center py-4">
                <span className="text-[10px] text-text-dim font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded">Moderation Mode Active</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs italic">D</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white italic">DAVE (MENTOR)</span>
                    <span className="text-[9px] text-text-dim uppercase font-mono">15:30</span>
                  </div>
                  <div className="bg-white/5 border border-border p-3 rounded-lg rounded-tl-none text-sm text-gray-300 max-w-md">
                    System-wide announcement: New skill battle launching at 17:00 UTC. Prepare your Linux kernels.
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-black">
              <div className="flex gap-2">
                <input type="text" placeholder="GLOBAL_BROADCAST..." className="flex-grow bg-white/5 border border-border rounded p-3 text-xs font-mono focus:border-primary focus:outline-none" />
                <button className="bg-primary text-black px-6 rounded font-bold text-xs uppercase tracking-widest hover:bg-white transition-all">Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CodeModal open={showCodeModal.open} code={showCodeModal.code} onClose={()=>setShowCodeModal({open:false})} />
      <ConfirmDialog open={confirmState.open} title={confirmState.title} message={confirmState.message} confirmLabel={confirmState.confirmLabel || 'Confirm'} onCancel={() => setConfirmState((s:any)=>({...s, open:false}))} onConfirm={() => { try { confirmState.onConfirm && confirmState.onConfirm(); } catch(e){ console.error(e); } }} />
      <PromptModal open={promptState.open} title={promptState.title} placeholder={promptState.placeholder} initial={promptState.initial} onCancel={() => setPromptState((s:any)=>({...s, open:false}))} onConfirm={(val:any) => { try { promptState.onConfirm && promptState.onConfirm(val); } catch(e){ console.error(e); } }} />
    </div>
  );
}
