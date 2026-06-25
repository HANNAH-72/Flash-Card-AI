import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Sparkles, 
  Layers, 
  BookOpen, 
  BarChart3, 
  UserCircle, 
  LogOut, 
  X,
  BrainCircuit,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ isOpen, onClose, isCollapsed, setIsCollapsed }) => {
  const { logout } = useAuth();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Generate Cards", path: "/generate", icon: Sparkles },
    { name: "My Flashcards", path: "/flashcards", icon: Layers },
    { name: "Study Mode", path: "/study", icon: BookOpen },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Profile", path: "/profile", icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Panel container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white dark:bg-gray-950 transition-all duration-350 lg:translate-x-0 lg:static glass-panel ${
          isCollapsed ? "lg:w-20 w-64" : "w-64"
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* App Title & Brand */}
        <div className={`flex items-center justify-between h-16 border-b border-gray-100 dark:border-gray-800/60 transition-all duration-350 ${
          isCollapsed ? "lg:px-4 px-6" : "px-6"
        }`}>
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
              <BrainCircuit className="w-5.5 h-5.5" />
            </div>
            {/* Smooth transition for text */}
            <AnimatePresence initial={false} mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight whitespace-nowrap"
                >
                  FlashMind <span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                title={isCollapsed ? link.name : ""}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-205 ${
                    isCollapsed ? "lg:justify-center lg:px-2" : ""
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 dark:from-indigo-600/90 dark:to-purple-600/90"
                      : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/10"
                  }`
                }
              >
                <Icon className="w-[1.2rem] h-[1.2rem] flex-shrink-0" />
                <AnimatePresence initial={false} mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer actions: Toggle & Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800/60 space-y-1.5">
          {/* Collapse sidebar button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-gray-500 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 cursor-pointer text-left ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-[1.2rem] h-[1.2rem]" />
            ) : (
              <ChevronLeft className="w-[1.2rem] h-[1.2rem]" />
            )}
            <AnimatePresence initial={false} mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap"
                >
                  Collapse Sidebar
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => logout(true)}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-500 rounded-xl hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-all duration-200 cursor-pointer text-left ${
              isCollapsed ? "lg:justify-center lg:px-2" : ""
            }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="w-[1.2rem] h-[1.2rem] shrink-0" />
            <AnimatePresence initial={false} mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
