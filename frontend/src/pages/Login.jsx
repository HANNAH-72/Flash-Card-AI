import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Brain, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleUseDemoAccount = async () => {
    const demoEmail = "student@flashmind.ai";
    const demoPassword = "FlashMind@2026";
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg("");
    addToast("Signing in with demo account...", "info");
    
    setIsSubmitting(true);
    console.log(`[LOGIN PAGE] Submitting login request for email: ${demoEmail}`);
    
    const result = await login(demoEmail, demoPassword);
    if (result.success) {
      console.log("[LOGIN PAGE] Login successful. Redirecting to dashboard.");
      addToast("Successfully logged in! Welcome back.", "success");
      navigate("/dashboard");
    } else {
      console.error(`[LOGIN PAGE] Login failed. Error: ${result.error}`);
      setErrorMsg(result.error);
      addToast(result.error, "error");
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    const autoLoginDemo = async () => {
      const explicitLogout = sessionStorage.getItem("explicitLogout");
      if (explicitLogout !== "true") {
        const demoEmail = "student@flashmind.ai";
        const demoPassword = "FlashMind@2026";
        setEmail(demoEmail);
        setPassword(demoPassword);
        setIsSubmitting(true);
        console.log("[LOGIN PAGE] Auto-logging in with demo account...");
        const result = await login(demoEmail, demoPassword);
        if (result.success) {
          console.log("[LOGIN PAGE] Auto-login successful. Redirecting to dashboard.");
          addToast("Logged in automatically as Demo User!", "success");
          navigate("/dashboard");
        } else {
          console.error(`[LOGIN PAGE] Auto-login failed: ${result.error}`);
          setIsSubmitting(false);
        }
      }
    };
    
    autoLoginDemo();
  }, [login, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      addToast("Invalid email address.", "error");
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      addToast("Password too short.", "error");
      return;
    }

    setIsSubmitting(true);
    console.log(`[LOGIN PAGE] Submitting login request for email: ${email}`);
    
    const result = await login(email, password);
    if (result.success) {
      console.log("[LOGIN PAGE] Login successful. Redirecting to dashboard.");
      addToast("Successfully logged in! Welcome back.", "success");
      navigate("/dashboard");
    } else {
      console.error(`[LOGIN PAGE] Login failed. Error: ${result.error}`);
      setErrorMsg(result.error);
      addToast(result.error, "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-6 py-12">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-2xl bg-white dark:bg-gray-900 glass-card">
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg mb-4">
            <Brain className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            Sign In
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Access your AI flashcard decks
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 text-left font-medium">
            {errorMsg}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Actions wrapper */}
          <div className="flex flex-col gap-3">
            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-75 disabled:hover:bg-indigo-600 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Use Demo Account button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleUseDemoAccount}
              className="flex w-full items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 dark:text-indigo-400 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-900/50 rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              Use Demo Account
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
