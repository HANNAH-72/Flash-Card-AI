import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Brain, Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    // Passwords check
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      addToast("Passwords do not match.", "error");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      addToast("Password must be at least 6 characters.", "error");
      return;
    }

    setIsSubmitting(true);
    
    const result = await register(fullName, email, password);
    if (result.success) {
      addToast("Account created successfully! Logging you in...", "success");
      // Auto login
      const loginResult = await login(email, password);
      if (loginResult.success) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } else {
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
            Create Account
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Join FlashMind AI and start learning
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 text-left font-medium">
            {errorMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name input */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                placeholder="John Doe"
                disabled={isSubmitting}
              />
            </div>
          </div>

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
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Password
            </label>
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

          {/* Confirm Password input */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-75 disabled:hover:bg-indigo-600 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
