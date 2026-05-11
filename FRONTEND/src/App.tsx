import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Suspense, lazy, useState, useEffect } from "react";
import { API_ROOT } from "./config";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import Home from "./pages/Home.tsx";

const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const StudentDashboard = lazy(() => import("./pages/Dashboard/StudentDashboard.tsx"));
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard.tsx"));

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-black text-primary font-mono uppercase tracking-[0.2em]">
      Loading_Module...
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_ROOT}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    // ensure splash doesn't show longer than 2s
    const t = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);
  if (loading && showSplash) return <div className="min-h-screen flex items-center justify-center bg-black text-primary font-mono uppercase tracking-[0.2em]">Initializing_Davex...</div>;

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} setUser={setUser} />
        <main className="flex-grow">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route 
                path="/dashboard" 
                element={
                  user ? (
                    user.role === "ADMIN" ? <AdminDashboard /> : <StudentDashboard user={user} />
                  ) : <Navigate to="/login" />
                } 
              />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}
