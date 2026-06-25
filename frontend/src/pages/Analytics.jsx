import React, { useEffect, useState } from "react";
import api from "../services/api";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import { ChartSkeleton, StatCardSkeleton } from "../components/Skeleton";
import StatCard from "../components/StatCard";
import { 
  Layers, 
  BookOpen, 
  CheckCircle, 
  Flame, 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon 
} from "lucide-react";
import { useToast } from "../context/ToastContext";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/analytics");
        setAnalyticsData(res.data);
      } catch (err) {
        console.error(err);
        addToast("Failed to fetch learning analytics.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [addToast]);

  // Color Palette for Pie Chart Cells (matching CSS design)
  const COLORS = ["#10b981", "#f59e0b", "#f43f5e"]; // Easy (emerald), Medium (amber), Hard (rose)

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight leading-tight">
          Learning Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Detailed metrics charting your memory retention and weekly progress.
        </p>
      </div>

      {/* Numerical Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Flashcards"
              value={analyticsData?.total_flashcards || 0}
              icon={Layers}
              color="indigo"
            />
            <StatCard
              title="Total Reviews Logged"
              value={analyticsData?.total_reviews || 0}
              icon={BookOpen}
              color="amber"
            />
            <StatCard
              title="Average Recall Accuracy"
              value={`${analyticsData?.accuracy_percentage || 0}%`}
              icon={CheckCircle}
              color="rose"
            />
            <StatCard
              title="Active Streak"
              value={`${analyticsData?.study_streak || 0} Days`}
              icon={Flame}
              color="emerald"
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Line Chart - Weekly Progress */}
        <div className="p-6 border bg-white/40 dark:bg-gray-900/40 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
              Weekly Progress (Reviews per Day)
            </h3>
          </div>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.weekly_progress || []} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#37415120" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} fontWeight={600} />
                  <YAxis stroke="#9ca3af" fontSize={11} fontWeight={600} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(17, 24, 39, 0.8)", 
                      border: "none", 
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reviewed" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ r: 4, stroke: "#6366f1", strokeWidth: 2 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CHART 2: Bar Chart - Subject Performance */}
        <div className="p-6 border bg-white/40 dark:bg-gray-900/40 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
              Cards & Performance by Subject
            </h3>
          </div>
          {loading ? (
            <ChartSkeleton />
          ) : (analyticsData?.subject_performance || []).length === 0 ? (
            <p className="text-xs text-gray-400 font-semibold italic text-center py-20">
              No subjects generated yet.
            </p>
          ) : (
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.subject_performance || []} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#37415120" />
                  <XAxis dataKey="subject" stroke="#9ca3af" fontSize={11} fontWeight={600} />
                  <YAxis stroke="#9ca3af" fontSize={11} fontWeight={600} />
                  <Tooltip
                    contentStyle={{ 
                      background: "rgba(17, 24, 39, 0.8)", 
                      border: "none", 
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
                  <Bar dataKey="count" name="Card Count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accuracy" name="Recall Acc (%)" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CHART 3: Pie Chart - Difficulty Distribution */}
        <div className="p-6 border bg-white/40 dark:bg-gray-900/40 rounded-3xl glass-panel space-y-4 lg:col-span-2 max-w-xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
              Difficulty Distribution
            </h3>
          </div>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-[240px]">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData?.difficulty_distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="difficulty"
                    >
                      {(analyticsData?.difficulty_distribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends explanation */}
              <div className="space-y-3.5">
                {(analyticsData?.difficulty_distribution || []).map((entry, index) => (
                  <div key={entry.difficulty} className="flex items-center gap-3.5">
                    <div 
                      className="w-3.5 h-3.5 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className="text-sm">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {entry.difficulty}:
                      </span>{" "}
                      <span className="text-gray-500 font-semibold dark:text-gray-400">
                        {entry.count} cards
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
