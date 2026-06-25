import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareCode, Sparkles, BookOpen, BrainCircuit, X } from "lucide-react";

const AssistantPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const tips = [
    {
      title: "Generate Flashcards",
      description: "Paste your raw study notes, lecture scripts, or text in 'Generate Cards'. The AI will identify key terminology, definitions, and concepts to construct Q&A pairs.",
      icon: Sparkles,
      color: "text-indigo-500 bg-indigo-500/10"
    },
    {
      title: "Active Recall & Spaced Repetition",
      description: "Go to 'Study Mode' to review due flashcards. Answering honestly (Easy, Medium, Hard) allows our scheduling system to optimize intervals for long-term retention.",
      icon: BookOpen,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Boost Your Recall Accuracy",
      description: "A recall accuracy above 80% indicates solid retention. Try chunking your notes into smaller sections before generation for cleaner flashcards.",
      icon: BrainCircuit,
      color: "text-amber-500 bg-amber-500/10"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Panel Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="w-[320px] sm:w-[380px] h-[520px] mb-4 overflow-hidden rounded-3xl border border-white/15 dark:border-white/10 shadow-2xl glass-panel flex flex-col text-left"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100/40 dark:border-gray-800/60 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                  <BrainCircuit className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white font-heading">
                    FlashMind Assistant
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    AI Agent Active
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-850/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Hi there! 👋 I am your learning assistant. Here is a quick guide to help you master anything.
                </p>
              </div>

              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Quick Tips & Help
                </span>

                {tips.map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <div key={idx} className="flex gap-3 p-3.5 rounded-2xl bg-white/20 dark:bg-gray-950/20 border border-gray-105 dark:border-gray-800/40 hover:border-indigo-500/30 transition-all duration-200">
                      <div className={`p-2 rounded-xl ${tip.color} self-start shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-gray-900 dark:text-white font-heading">
                          {tip.title}
                        </h5>
                        <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 font-medium">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-gray-100/40 dark:border-gray-800/60 bg-gray-50/20 dark:bg-gray-950/30 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-semibold">
                FlashMind AI v1.0.0
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 text-[11px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/35 border border-white/10 cursor-pointer focus:outline-none relative group"
        title="Open AI Help Panel"
      >
        <span className="absolute inset-0 rounded-full bg-indigo-500/20 scale-100 group-hover:scale-120 animate-ping duration-1000 -z-10 pointer-events-none" />
        <MessageSquareCode className="w-6 h-6 group-hover:rotate-6 transition-transform duration-200" />
      </motion.button>
    </div>
  );
};

export default AssistantPanel;
