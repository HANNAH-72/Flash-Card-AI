import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Loader2 } from "lucide-react";

const AssistantPanel = lazy(() => import("./components/AssistantPanel"));

// Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Generate = lazy(() => import("./pages/Generate"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const StudyMode = lazy(() => import("./pages/StudyMode"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// --- Route Protection Wrapper ---
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent text-sky-500">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- Prevent Logged In Users from viewing Login/Register ---
const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent text-sky-500">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- Dashboard Layout Shell ---
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-[var(--text-primary)]">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* Main content frame */}
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        {/* Header Navbar */}
        <Navbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          isCollapsed={isCollapsed} 
        />
        
        {/* Page Inner Container */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
          <div className="w-full max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  React.useEffect(() => {
    // Dynamic page title loading sequence starts on app mount
    document.title = "Loading...";
    const t = setTimeout(() => {
      document.title = "FlashMind AI";
    }, 600); // Transition to main app name after 600ms
    return () => clearTimeout(t);
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="relative min-h-screen overflow-hidden transition-colors duration-500">
              {/* --- exciting Background Effects (Theme-Aware Aurora Blobs) --- */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Top-left blob */}
                <div 
                  className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full blur-[130px] animate-blob"
                  style={{ backgroundColor: 'var(--blob-one)' }}
                ></div>
                {/* Mid-right blob */}
                <div 
                  className="absolute top-[30%] right-[5%] w-[45%] h-[45%] rounded-full blur-[125px] animate-blob animation-delay-2000"
                  style={{ backgroundColor: 'var(--blob-two)' }}
                ></div>
                {/* Bottom-left blob */}
                <div 
                  className="absolute -bottom-[10%] left-[15%] w-[50%] h-[50%] rounded-full blur-[140px] animate-blob animation-delay-4000"
                  style={{ backgroundColor: 'var(--blob-three)' }}
                ></div>

                {/* Floating particle elements */}
                <div className="absolute top-[20%] left-[10%] w-6 h-6 rounded-full bg-indigo-500/20 blur-xs animate-particle-1"></div>
                <div className="absolute top-[60%] right-[15%] w-8 h-8 rounded-full bg-purple-500/20 blur-xs animate-particle-2 delay-1000"></div>
                <div className="absolute bottom-[20%] left-[30%] w-5 h-5 rounded-full bg-cyan-500/20 blur-xs animate-particle-3 delay-3000"></div>
                <div className="absolute top-[40%] left-[80%] w-7 h-7 rounded-full bg-indigo-400/15 blur-xs animate-particle-1 delay-5000"></div>
                
                {/* Soft glowing circles */}
                <div className="absolute top-[15%] right-[25%] w-[250px] h-[250px] rounded-full bg-indigo-500/5 blur-[80px] animate-pulse"></div>
                <div className="absolute bottom-[25%] left-[5%] w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[95px] animate-pulse"></div>
              </div>
              
              {/* Foreground content container */}
              <div className="relative z-10 w-full min-h-screen">
                <Suspense fallback={
                  <div className="flex h-screen w-screen items-center justify-center bg-transparent text-sky-500">
                    <Loader2 className="w-10 h-10 animate-spin" />
                  </div>
                }>
                  <Routes>
                    {/* Public Landing Page */}
                    <Route path="/" element={<Home />} />

                    {/* Public Auth Pages */}
                    <Route
                      path="/login"
                      element={
                        <PublicRoute>
                          <Login />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <PublicRoute>
                          <Register />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <PublicRoute>
                          <ForgotPassword />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/reset-password"
                      element={
                        <PublicRoute>
                          <ResetPassword />
                        </PublicRoute>
                      }
                    />

                    {/* Protected Dashboard Routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Dashboard />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/generate"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Generate />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/flashcards"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Flashcards />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/study"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <StudyMode />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Analytics />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Profile />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Redirect any other path to Home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </div>
              
              {/* Floating AI Assistant Panel */}
              <Suspense fallback={null}>
                <AssistantPanel />
              </Suspense>
            </div>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
