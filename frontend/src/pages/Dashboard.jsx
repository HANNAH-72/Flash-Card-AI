import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import StatCard from "../components/StatCard";
import { StatCardSkeleton, ListSkeleton, ChartSkeleton } from "../components/Skeleton";
import { 
  Layers, 
  FolderGit, 
  BookOpen, 
  CheckCircle, 
  Flame, 
  Sparkles, 
  ChevronRight,
  History,
  Clock,
  StickyNote,
  Percent,
  Calendar,
  TrendingUp,
  BarChart3,
  Activity
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, Cell
} from "recharts";
import { useToast } from "../context/ToastContext";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    } 
  }
};

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentCards, setRecentCards] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, cardsRes, sessionsRes] = await Promise.all([
          api.get("/api/analytics"),
          api.get("/api/flashcards?limit=5"),
          api.get("/api/reviews/sessions?limit=5")
        ]);

        setAnalytics(analyticsRes.data);
        setRecentCards(cardsRes.data.items || []);
        setSessions(sessionsRes.data || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
        addToast("Failed to fetch dashboard data. Please try reloading.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [addToast]);

  const subjectCount = analytics?.subject_performance?.length || 0;

  // Custom tooltips styling for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-gray-900/90 dark:bg-gray-950/90 border border-white/10 backdrop-blur-md rounded-xl text-left text-xs font-semibold shadow-xl">
          <p className="text-gray-400 mb-1">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color || pld.fill }}>
              {pld.name}: {pld.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 3. Accuracy Trend mapping
  const accuracyTrendData = sessions.length > 0
    ? sessions.slice().reverse().map((session, idx) => ({
        name: new Date(session.session_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        accuracy: session.accuracy
      }))
    : [
        { name: "Mon", accuracy: 70 },
        { name: "Tue", accuracy: 75 },
        { name: "Wed", accuracy: 72 },
        { name: "Thu", accuracy: 80 },
        { name: "Fri", accuracy: 85 },
        { name: "Sat", accuracy: 88 },
        { name: "Sun", accuracy: 90 }
      ];

  // 4. Card Generation Difficulty Distribution Data mapping
  const difficultyDistribution = analytics?.difficulty_distribution || [
    { difficulty: "Easy", count: 0 },
    { difficulty: "Medium", count: 0 },
    { difficulty: "Hard", count: 0 }
  ];

  const difficultyColors = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 text-left pb-12"
    >
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-white/15 dark:border-white/5 bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-transparent p-6 sm:p-10 md:p-12 text-left flex flex-col md:flex-row items-center justify-between gap-8 glass-panel shadow-2xl"
      >
        <div className="flex-1 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-Powered Memory Optimization</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight leading-tight">
            Supercharge Your <span className="animate-gradient-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Learning with AI</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium max-w-lg leading-relaxed">
            Generate smart flashcards, review efficiently, and master any subject faster using AI-powered learning.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/generate"
              className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all duration-200"
            >
              <Sparkles className="w-4.5 h-4.5" />
              Generate New Cards
            </Link>
            <Link
              to="/study"
              className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-250 bg-white/40 dark:bg-gray-850/40 hover:bg-white/60 dark:hover:bg-gray-800/60 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl transition-all duration-200"
            >
              <BookOpen className="w-4.5 h-4.5" />
              Start Studying
            </Link>
          </div>
        </div>

        {/* AI SVG Illustration */}
        <div className="w-44 h-44 md:w-60 md:h-60 flex items-center justify-center shrink-0 relative">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
          <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 select-none">
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#hero-ring-grad)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-spin" style={{ animationDuration: '30s' }} />
            <circle cx="100" cy="100" r="60" fill="none" stroke="url(#hero-ring-grad-2)" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            
            <g transform="translate(100, 100)">
              <line x1="-35" y1="-25" x2="0" y2="35" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="35" y1="-25" x2="0" y2="35" stroke="#c084fc" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="-35" y1="-25" x2="35" y2="-25" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="-35" y1="-25" x2="0" y2="-35" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="35" y1="-25" x2="0" y2="-35" stroke="#c084fc" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="0" y1="-35" x2="0" y2="35" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.5" />
              
              <circle cx="-35" cy="-25" r="8" fill="#6366f1" className="animate-ping" style={{ animationDuration: '3s' }} />
              <circle cx="-35" cy="-25" r="6" fill="#6366f1" />
              
              <circle cx="35" cy="-25" r="8" fill="#a855f7" className="animate-ping" style={{ animationDuration: '4s' }} />
              <circle cx="35" cy="-25" r="6" fill="#a855f7" />
              
              <circle cx="0" cy="35" r="10" fill="#06b6d4" className="animate-ping" style={{ animationDuration: '2.5s' }} />
              <circle cx="0" cy="35" r="8" fill="#06b6d4" />
              
              <circle cx="0" cy="-35" r="6" fill="#818cf8" />
            </g>
            
            <defs>
              <linearGradient id="hero-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="hero-ring-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* Numerical Stats Dashboard Grid */}
      <motion.div 
        variants={itemVariants} 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Flashcards"
              value={analytics?.total_flashcards || 0}
              icon={Layers}
              color="indigo"
              trend="+8%"
              trendType="up"
              sparkline={[12, 15, 18, 20, 24, analytics?.total_flashcards || 30]}
            />
            <StatCard
              title="Subjects"
              value={subjectCount}
              icon={FolderGit}
              color="amber"
              trend="+12%"
              trendType="up"
              sparkline={[1, 2, 2, 3, 3, subjectCount || 4]}
            />
            <StatCard
              title="Study Sessions"
              value={sessions.length}
              icon={BookOpen}
              color="emerald"
              trend="+6%"
              trendType="up"
              sparkline={[1, 2, 2, 3, 4, sessions.length || 5]}
            />
            <StatCard
              title="Accuracy"
              value={`${analytics?.accuracy_percentage || 0}%`}
              icon={CheckCircle}
              color="rose"
              trend="+2.5%"
              trendType="up"
              sparkline={[70, 72, 75, 73, 78, analytics?.accuracy_percentage || 80]}
            />
            <StatCard
              title="Learning Streak"
              value={`${analytics?.study_streak || 0} Days`}
              icon={Flame}
              color="amber"
              trend="+1 Day"
              trendType="up"
              sparkline={[1, 2, 3, 2, 3, analytics?.study_streak || 4]}
            />
            <StatCard
              title="Cards Due Today"
              value={analytics?.cards_due_today || 0}
              icon={Calendar}
              color="cyan"
              trend={analytics?.cards_due_today > 0 ? "Active" : "Cleared"}
              trendType={analytics?.cards_due_today > 0 ? "up" : "neutral"}
              sparkline={[10, 8, 12, 5, 2, analytics?.cards_due_today || 0]}
            />
            <StatCard
              title="AI Generated Notes"
              value={analytics?.ai_generated_notes || 0}
              icon={StickyNote}
              color="purple"
              trend="+20%"
              trendType="up"
              sparkline={[4, 6, 10, 12, 15, analytics?.ai_generated_notes || 18]}
            />
            <StatCard
              title="Review Completion Rate"
              value={`${analytics?.review_completion_rate || 0}%`}
              icon={Percent}
              color="emerald"
              trend="+5%"
              trendType="up"
              sparkline={[80, 82, 85, 90, 93, analytics?.review_completion_rate || 95]}
            />
          </>
        )}
      </motion.div>

      {/* Analytics Charts & Widgets Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Dashboard Analytics
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time interactive intelligence trackers for your learning profile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Weekly Progress */}
          <div className="p-5 border border-white/10 dark:border-white/5 rounded-3xl glass-panel space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
              <h3 className="text-sm font-bold text-gray-950 dark:text-white font-heading">
                Weekly Learning Progress (Reviews)
              </h3>
            </div>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.weekly_progress || []} margin={{ left: -22, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.08)" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} fontWeight={600} />
                    <YAxis stroke="#9ca3af" fontSize={10} fontWeight={600} />
                    <Tooltip 
                      contentStyle={{ 
                        background: "rgba(15, 23, 42, 0.9)", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: "14px",
                        color: "#fff",
                        fontSize: "11px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="reviewed" 
                      name="Cards Reviewed"
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      dot={{ r: 4, stroke: "#6366f1", strokeWidth: 2, fill: "#fff" }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Subject Performance */}
          <div className="p-5 border border-white/10 dark:border-white/5 rounded-3xl glass-panel space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-amber-500" />
              <h3 className="text-sm font-bold text-gray-950 dark:text-white font-heading">
                Subject Performance Metrics
              </h3>
            </div>
            {loading ? (
              <ChartSkeleton />
            ) : (analytics?.subject_performance || []).length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-xs font-semibold text-gray-450 italic">
                No subject stats recorded. Generate cards to start!
              </div>
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.subject_performance || []} margin={{ left: -22, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.08)" />
                    <XAxis dataKey="subject" stroke="#9ca3af" fontSize={10} fontWeight={600} />
                    <YAxis stroke="#9ca3af" fontSize={10} fontWeight={600} />
                    <Tooltip
                      contentStyle={{ 
                        background: "rgba(15, 23, 42, 0.9)", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: "14px",
                        color: "#fff",
                        fontSize: "11px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px", fontWeight: 600, pt: 5 }} />
                    <Bar dataKey="count" name="Card Count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="accuracy" name="Accuracy (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 3: Accuracy Trend */}
          <div className="p-5 border border-white/10 dark:border-white/5 rounded-3xl glass-panel space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
              <h3 className="text-sm font-bold text-gray-950 dark:text-white font-heading">
                Memory Accuracy Retention Trend
              </h3>
            </div>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accuracyTrendData} margin={{ left: -22, right: 10, top: 10 }}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.08)" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} fontWeight={600} />
                    <YAxis stroke="#9ca3af" fontSize={10} fontWeight={600} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="accuracy" 
                      name="Recall Accuracy"
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorAcc)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 4: Flashcard Difficulty Distribution */}
          <div className="p-5 border border-white/10 dark:border-white/5 rounded-3xl glass-panel space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-purple-500" />
              <h3 className="text-sm font-bold text-gray-950 dark:text-white font-heading">
                Difficulty Level Distribution
              </h3>
            </div>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyDistribution} margin={{ left: -22, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.08)" />
                    <XAxis dataKey="difficulty" stroke="#9ca3af" fontSize={10} fontWeight={600} />
                    <YAxis stroke="#9ca3af" fontSize={10} fontWeight={600} />
                    <Tooltip 
                      contentStyle={{ 
                        background: "rgba(15, 23, 42, 0.9)", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: "14px",
                        color: "#fff",
                        fontSize: "11px"
                      }}
                    />
                    <Bar dataKey="count" name="Cards Count" radius={[4, 4, 0, 0]}>
                      {difficultyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={difficultyColors[index % difficultyColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Activity Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Side: Recent Cards */}
        <div className="lg:col-span-2 p-6 border border-white/10 dark:border-white/5 rounded-3xl glass-panel text-left flex flex-col justify-between min-h-[360px]">
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/35">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-905 dark:text-white font-heading">
                  Recently Generated Cards
                </h3>
              </div>
              <Link
                to="/flashcards"
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <ListSkeleton />
            ) : recentCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-2xl border-gray-200 dark:border-gray-800">
                <Layers className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-sm font-semibold text-gray-405">
                  No flashcards generated yet.
                </p>
                <Link
                  to="/generate"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold mt-1"
                >
                  Generate now
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-150/40 dark:divide-gray-800/40">
                {recentCards.map((card) => (
                  <div key={card.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {card.question}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-indigo-500 dark:text-indigo-450 uppercase bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">
                        {card.subject}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                      {card.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Streaks & Session History */}
        <div className="p-6 border border-white/10 dark:border-white/5 rounded-3xl glass-panel text-left space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/35">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-905 dark:text-white font-heading">
                Study Streak
              </h3>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50/20 dark:bg-orange-950/10 border border-orange-500/10 relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 text-orange-500/5 group-hover:scale-110 transition-transform duration-350">
                <Flame className="w-24 h-24" />
              </div>
              <Flame className="w-10 h-10 text-orange-500 fill-orange-500 animate-pulse" />
              <div className="relative z-10">
                <p className="text-2xl font-black text-gray-950 dark:text-white font-heading">
                  {analytics?.study_streak || 0} Days
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  Active learning streak counter
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/35">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-905 dark:text-white font-heading">
                Recent Sessions
              </h3>
            </div>

            {loading ? (
              <ListSkeleton />
            ) : sessions.length === 0 ? (
              <p className="text-xs text-gray-450 font-semibold italic text-center py-4">
                No study sessions logged yet.
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-950/20"
                  >
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {new Date(session.session_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {session.total_reviewed} cards reviewed
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {session.accuracy}% Acc
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
