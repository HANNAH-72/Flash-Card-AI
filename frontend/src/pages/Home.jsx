import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Brain, Sparkles, BookOpen, Layers, CheckCircle2, ChevronRight, GraduationCap } from "lucide-react";

const Home = () => {
  const { token } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      {/* Landing Navbar */}
      <nav className="flex items-center justify-between w-full h-16 px-6 lg:px-16 border-b bg-white/40 dark:bg-gray-950/40 backdrop-blur-md border-gray-100 dark:border-gray-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            FlashMind <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {token ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition-all duration-200"
            >
              Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/40 text-xs font-semibold mb-6 animate-fade-in shadow-inner">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Spaced Repetition Platform
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight mb-6 leading-tight max-w-4xl">
          Transform Your Notes Into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Smart Flashcards
          </span>{" "}
          Instantly
        </h1>
        
        <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed font-medium">
          Upload PDF notes or paste study guides. Our local AI extracts keywords, builds flashcard Q&A decks, and schedules reviews using a scientifically-proven spaced repetition algorithm.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            to={token ? "/dashboard" : "/register"}
            className="flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            Start Generating Free <ChevronRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="flex items-center justify-center px-7 py-4 text-base font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800/80 transition-all duration-200 hover:-translate-y-0.5"
          >
            Learn More
          </a>
        </div>

        {/* Features Preview Cards Grid */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12 border-t border-gray-200/60 dark:border-gray-900/60">
          <div className="p-6 rounded-2xl border bg-white dark:bg-gray-900/40 glass-card text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">
              NLP Card Generator
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Upload PDF documents or enter summaries. Our AI tokenizes structure and outputs question-answer cards with automatic difficulties.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-white dark:bg-gray-900/40 glass-card text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">
              Spaced Repetition
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Optimize study patterns with standard learning intervals. Hard cards are reviewed daily, while easy cards are scheduled every 5 days.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-white dark:bg-gray-900/40 glass-card text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">
              Analytics Insights
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Monitor weekly progress, success rates, study streak levels, and subject strengths with charts and glass statistics panels.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-900/60 bg-white/20 dark:bg-gray-950/20">
        <p>© 2026 FlashMind AI. All rights reserved. Locally executed AI model architecture.</p>
      </footer>
    </div>
  );
};

export default Home;
