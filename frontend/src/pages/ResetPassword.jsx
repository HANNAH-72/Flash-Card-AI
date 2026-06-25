import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { Brain, Lock, ArrowRight, Loader2, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      setErrorMsg("Password reset token is missing from the URL.");
      addToast("Missing reset token.", "error");
      return;
    }

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
    console.log(`[RESET PASSWORD] Submitting password reset request for token: ${token.substring(0, 10)}...`);

    try {
      await api.post("/api/auth/reset-password", {
        token,
        new_password: password,
      });
      console.log("[RESET PASSWORD] Password reset successful");
      setIsSuccess(true);
      addToast("Password has been reset successfully!", "success");
    } catch (err) {
      console.error("[RESET PASSWORD] API request failed:", err);
      const detail = err.response?.data?.detail || "Invalid or expired reset token.";
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
            Create New Password
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Enter your new secure password
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
                Success!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
            </div>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 transition-all duration-200"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Password input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                New Password
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

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="text-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
              >
                Cancel and Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
