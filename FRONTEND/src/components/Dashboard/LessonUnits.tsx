import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Plus, Trash2, FileText } from "lucide-react";
import { API_ROOT } from "../../config";
import toast from "react-hot-toast";

interface Lesson {
  _id: string;
  title: string;
  content: string;
  status: "pending" | "completed";
  order: number;
}

export default function LessonUnits({ isAdmin = false }: { isAdmin?: boolean }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: "", content: "", order: 0 });

  const fetchLessons = async () => {
    try {
      const res = await fetch(`${API_ROOT}/api/lessons`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      }
    } catch (err) {
      toast.error("Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
      const { csrfToken } = await tokenRes.json();
      const res = await fetch(`${API_ROOT}/api/lessons`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken || '' },
        body: JSON.stringify(newLesson)
      });
      if (res.ok) {
        toast.success("Lesson Unit added to curriculum");
        setShowAddForm(false);
        setNewLesson({ title: "", content: "", order: lessons.length });
        fetchLessons();
      }
    } catch (err) {
      toast.error("Error creating lesson");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
      const { csrfToken } = await tokenRes.json();
      const res = await fetch(`${API_ROOT}/api/lessons/${id}/complete`, {
        method: "PATCH",
        credentials: 'include',
        headers: { 'x-csrf-token': csrfToken || '' }
      });
      if (res.ok) {
        toast.success("Unit marked as completed");
        fetchLessons();
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this lesson unit?")) return;
    try {
      const tokenRes = await fetch(`${API_ROOT}/api/auth/csrf-token`, { credentials: 'include' });
      const { csrfToken } = await tokenRes.json();
      const res = await fetch(`${API_ROOT}/api/lessons/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: { 'x-csrf-token': csrfToken || '' }
      });
      if (res.ok) {
        toast.success("Lesson removed");
        fetchLessons();
      }
    } catch (err) {
      toast.error("Error deleting lesson");
    }
  };

  if (loading) return <div className="text-center p-8 font-mono text-text-dim">Loading_Syllabus_Data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-dim flex items-center gap-2">
          Course Curriculum <span className="text-primary font-mono ml-2">● {lessons.length} Modules</span>
        </h3>
        {isAdmin && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 text-[10px] font-bold text-primary hover:text-white transition-colors uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Add Lesson
          </button>
        )}
      </div>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="technical-card border-primary/20 bg-primary/5 p-6"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Lesson Title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                required
                className="bg-black border border-border p-3 rounded text-sm focus:border-primary focus:outline-none"
              />
              <input 
                type="number" 
                placeholder="Order"
                value={newLesson.order}
                onChange={(e) => setNewLesson({...newLesson, order: parseInt(e.target.value)})}
                className="bg-black border border-border p-3 rounded text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <textarea 
              placeholder="Lesson Content / Objectives"
              value={newLesson.content}
              onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
              required
              rows={3}
              className="w-full bg-black border border-border p-3 rounded text-sm focus:border-primary focus:outline-none"
            />
            <div className="flex gap-4">
              <button type="submit" className="bg-primary text-black font-bold px-6 py-2 rounded text-xs uppercase tracking-widest font-mono">
                Deploy Module
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-text-dim hover:text-white text-xs uppercase tracking-widest font-mono"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {lessons.length === 0 ? (
          <div className="text-center p-12 text-text-dim border border-dashed border-border rounded-xl">
            No lesson units currently deployed.
          </div>
        ) : (
          lessons.map((lesson) => (
            <motion.div 
              key={lesson._id}
              className={`technical-card transition-all ${
                lesson.status === "completed" 
                  ? "opacity-50 grayscale bg-white/5" 
                  : "bg-black/40 border-l-2 border-l-primary"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                  <div className={`p-2 rounded ${lesson.status === "completed" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
                    {lesson.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white tracking-tight">{lesson.title}</h4>
                      {lesson.status === "completed" && (
                        <span className="text-[9px] font-mono bg-green-500 text-black px-2 py-0.5 rounded font-bold uppercase">Completed</span>
                      )}
                    </div>
                    <p className="text-xs text-text-dim mt-1 font-mono">{lesson.content}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isAdmin && lesson.status === "pending" && (
                    <button 
                      onClick={() => handleComplete(lesson._id)}
                      className="p-2 border border-border rounded hover:border-green-500 hover:text-green-500 transition-all"
                      title="Mark as Completed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(lesson._id)}
                      className="p-2 border border-border rounded hover:border-red-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {!isAdmin && lesson.status === "pending" && (
                    <div className="flex items-center gap-1 text-[10px] text-primary font-mono uppercase">
                      <Clock className="w-3 h-3" />
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
