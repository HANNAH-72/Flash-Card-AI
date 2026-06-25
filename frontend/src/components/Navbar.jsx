import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LogOut, User, Menu, Bell, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const themeOptions = [
    { id: "light", name: "Light Mode", emoji: "☀️", color: "from-amber-200 to-orange-400" },
    { id: "dark", name: "Dark Mode", emoji: "🌙", color: "from-slate-700 to-slate-900" },
    { id: "purple", name: "Purple AI", emoji: "✨", color: "from-purple-500 to-pink-500" },
    { id: "ocean", name: "Ocean Blue", emoji: "🌊", color: "from-cyan-400 to-blue-600" },
    { id: "emerald", name: "Emerald", emoji: "🍀", color: "from-emerald-400 to-teal-600" }
  ];

  const activeThemeOption = themeOptions.find((opt) => opt.id === theme) || themeOptions[1];

  return (
    <header className="sticky top-0 z-45 flex items-center justify-between w-full h-16 px-6 border-b glass-panel transition-all duration-300">
      {/* Left: Mobile Toggle & App Brand Indicator */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-800/50 lg:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg font-heading">
            F
          </div>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            FlashMind
          </span>
        </div>
      </div>

      {/* Right: Controls & User Profile Dropdown */}
      <div className="flex items-center gap-3.5 ml-auto">
        {/* Multi-Theme Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setThemeDropdownOpen(!themeDropdownOpen);
              setDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-gray-800/40 bg-white/40 dark:bg-gray-950/20 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all duration-200 focus:outline-none cursor-pointer"
            title="Switch Theme"
          >
            <span>{activeThemeOption.emoji}</span>
            <span className="hidden sm:inline">{activeThemeOption.name}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Theme Dropdown Menu */}
          {themeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setThemeDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2.5 w-48 origin-top-right rounded-2xl border border-gray-100 dark:border-gray-850 bg-white dark:bg-gray-900 p-2 shadow-2xl z-40 animate-slide-up">
                <div className="px-2.5 py-1.5 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Select Theme
                  </span>
                </div>
                <div className="space-y-0.5">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        changeTheme(opt.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-xl transition-all duration-150 cursor-pointer ${
                        theme === opt.id
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-semibold"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-55/50 dark:hover:bg-gray-800/30"
                      }`}
                    >
                      <span className="text-sm">{opt.emoji}</span>
                      <span>{opt.name}</span>
                      {theme === opt.id && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Mock Indicator */}
        <button className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-gray-800/50 transition-all duration-200 hidden sm:block">
          <Bell className="w-[1.2rem] h-[1.2rem]" />
        </button>

        <div className="h-6 w-px bg-gray-200/60 dark:bg-gray-800/40"></div>

        {/* User Account Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setThemeDropdownOpen(false);
              }}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 focus:outline-none cursor-pointer"
            >
              {/* User Avatar Initials */}
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold font-heading text-sm shadow-sm shrink-0">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-left hidden md:block pr-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Student Account
                </p>
              </div>
            </button>

            {/* Dropdown Menu Overlay */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2.5 w-52 origin-top-right rounded-2xl border border-gray-100 dark:border-gray-850 bg-white dark:bg-gray-900 p-2 shadow-2xl z-40 animate-slide-up">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800/60 mb-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      Signed in as
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-all duration-150"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-150 cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
