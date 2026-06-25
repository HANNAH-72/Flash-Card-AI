import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  Layers, 
  BookOpen, 
  Trash2, 
  ShieldAlert,
  Loader2,
  CheckCircle2
} from "lucide-react";

const Profile = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { addToast } = useToast();

  // Profile fields state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  
  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // States
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Extra stats state
  const [stats, setStats] = useState({ cardsCount: 0, sessionsCount: 0 });

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Load profile specific stats
  useEffect(() => {
    const loadProfileStats = async () => {
      try {
        const [cardsRes, sessionsRes] = await Promise.all([
          api.get("/api/flashcards?limit=1"),
          api.get("/api/reviews/sessions?limit=50")
        ]);
        setStats({
          cardsCount: cardsRes.data.total || 0,
          sessionsCount: sessionsRes.data?.length || 0
        });
      } catch (err) {
        console.error("Error loading profile stats:", err);
      }
    };
    loadProfileStats();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      addToast("Full Name and Email are required.", "warning");
      return;
    }

    // Email change or credentials require verification password
    const isEmailChanged = email !== user.email;
    if (isEmailChanged && !currentPassword) {
      addToast("Please provide your current password to authorize email changes.", "warning");
      return;
    }

    setIsUpdatingProfile(true);
    const result = await updateProfile({
      full_name: fullName.trim(),
      email: email.trim(),
      current_password: currentPassword || undefined
    });

    if (result.success) {
      addToast("Profile details updated successfully!", "success");
      setCurrentPassword("");
    } else {
      addToast(result.error, "error");
    }
    setIsUpdatingProfile(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast("Please input your current password.", "warning");
      return;
    }
    if (newPassword.length < 6) {
      addToast("New password must be at least 6 characters.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match.", "warning");
      return;
    }

    setIsUpdatingPassword(true);
    const result = await updateProfile({
      current_password: currentPassword,
      new_password: newPassword
    });

    if (result.success) {
      addToast("Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      addToast(result.error, "error");
    }
    setIsUpdatingPassword(false);
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "CAUTION: Deleting your account will permanently wipe your profile, generated flashcards, and study progress logs. This action CANNOT be undone. Are you absolutely sure?"
    );
    if (!confirmation) return;

    setIsDeleting(true);
    const result = await deleteAccount();
    if (result.success) {
      addToast("Account permanently deleted. Goodbye!", "info");
    } else {
      addToast(result.error, "error");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-4xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight leading-tight">
          Account Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your student profile, account credentials, and data privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Summary & Stats */}
        <div className="space-y-6">
          <div className="p-6 border bg-white/40 dark:bg-gray-900/40 rounded-3xl glass-panel text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-2xl font-bold font-heading shadow-inner mx-auto">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">
                {user?.full_name}
              </h3>
              <p className="text-xs text-gray-400 font-semibold">{user?.email}</p>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4 flex flex-col gap-3 text-left">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Joined {formatDate(user?.created_at)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <Layers className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Generated {stats.cardsCount} flashcards</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Logged {stats.sessionsCount} study sessions</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* PROFILE UPDATE FORM */}
          <div className="p-6 border bg-white/40 dark:bg-gray-900/40 rounded-3xl glass-panel space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
              Update Profile Details
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Password authorization for sensitive updates */}
              {(email !== user?.email) && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Authorize email update with password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-rose-200 bg-gray-50/50 dark:border-rose-900/30 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white focus:border-rose-500"
                      placeholder="Enter current password..."
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-75 disabled:pointer-events-none ml-auto"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating Details...
                  </>
                ) : (
                  "Save Details"
                )}
              </button>
            </form>
          </div>

          {/* PASSWORD UPDATE FORM */}
          <div className="p-6 border bg-white/40 dark:bg-gray-900/40 rounded-3xl glass-panel space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
              Update Account Password
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                    placeholder="Enter current password..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                      placeholder="At least 6 chars..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                      placeholder="Confirm new password..."
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-75 disabled:pointer-events-none ml-auto"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </div>

          {/* DANGER ZONE: DELETE ACCOUNT */}
          <div className="p-6 border border-rose-500/10 bg-rose-500/5 rounded-3xl space-y-4 text-left">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-base font-bold font-heading">
                Danger Zone
              </h3>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
              Deleting your profile removes all data records, study tracking histories, and generated decks immediately. This transaction is final and permanent.
            </p>

            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition-all duration-200 cursor-pointer disabled:opacity-75"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Wiping Account...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Permanently Delete Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
