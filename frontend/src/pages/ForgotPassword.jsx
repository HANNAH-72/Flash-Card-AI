import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { Brain, Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      addToast("Invalid email address.", "error");
      return;
    }

    setIsSubmitting(true);
    console.log(`[FORGOT PASSWORD] Submitting forgot-password request for email: ${email}`);

    try {
      await api.post("/api/auth/forgot-password", { email });
      console.log("[FORGOT PASSWORD] API request successful");
      setIsSuccess(true);
      addToast("Reset link generated! Check the backend console.", "success");
    } catch (err) {
      console.error("[FORGOT PASSWORD] API request failed:", err);
      const detail = err.response?.data?.detail || "Something went wrong. Please try again later.";
      setErrorMsg(detail);
      addToast(detail, "error");
    } finally {
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
            Reset Password
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            We will send you a recovery link
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 text-left font-medium">
            {errorMsg}
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center text-emerald-500">
              <CheckCircle className="w-16 h-16 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Check Backend Logs
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                If the email <strong>{email}</strong> is registered, a password reset link has been printed to the backend terminal logs.
              </p>
            </div>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 transition-all duration-200"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
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

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="text-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
