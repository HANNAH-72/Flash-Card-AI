import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "indigo", 
  trend, 
  trendType = "up",
  sparkline = [20, 30, 25, 45, 40, 60] 
}) => {
  const getColorStyles = (color) => {
    switch (color) {
      case "emerald":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
          text: "text-emerald-600 dark:text-emerald-400",
          border: "border-emerald-100 dark:border-emerald-900/30",
          glow: "rgba(16, 185, 129, 0.25)"
        };
      case "rose":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/20",
          text: "text-rose-600 dark:text-rose-400",
          border: "border-rose-100 dark:border-rose-900/30",
          glow: "rgba(244, 63, 94, 0.25)"
        };
      case "amber":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          text: "text-amber-600 dark:text-amber-400",
          border: "border-amber-100 dark:border-amber-900/30",
          glow: "rgba(245, 158, 11, 0.25)"
        };
      case "cyan":
        return {
          bg: "bg-cyan-50 dark:bg-cyan-950/20",
          text: "text-cyan-600 dark:text-cyan-400",
          border: "border-cyan-100 dark:border-cyan-900/30",
          glow: "rgba(6, 182, 212, 0.25)"
        };
      case "purple":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/20",
          text: "text-purple-600 dark:text-purple-400",
          border: "border-purple-100 dark:border-purple-900/30",
          glow: "rgba(139, 92, 246, 0.25)"
        };
      case "indigo":
      default:
        return {
          bg: "bg-indigo-50 dark:bg-indigo-950/20",
          text: "text-indigo-600 dark:text-indigo-400",
          border: "border-indigo-100 dark:border-indigo-900/30",
          glow: "rgba(99, 102, 241, 0.25)"
        };
    }
  };

  const styles = getColorStyles(color);

  // Generate SVG path for a mini sparkline
  const width = 80;
  const height = 28;
  const padding = 2;
  const maxVal = Math.max(...sparkline, 1);
  const minVal = Math.min(...sparkline, 0);
  const range = maxVal - minVal || 1;

  const points = sparkline.map((val, idx) => {
    const x = padding + (idx / (sparkline.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  // Trend styling
  const getTrendColor = () => {
    if (trendType === "up") return "text-emerald-500 bg-emerald-500/10";
    if (trendType === "down") return "text-rose-500 bg-rose-500/10";
    return "text-gray-400 bg-gray-400/10";
  };

  const TrendIcon = trendType === "up" ? TrendingUp : (trendType === "down" ? TrendingDown : Minus);
  const uniqueId = title ? title.replace(/\s+/g, '') : "sparkline";

  return (
    <div 
      className="flex flex-col justify-between p-5 rounded-3xl border bg-white/40 dark:bg-gray-900/40 glass-card transition-all duration-350 select-none cursor-default group"
      style={{
        "--primary-glow": styles.glow
      }}
    >
      {/* Top Section */}
      <div className="flex items-start justify-between w-full">
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            {title}
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight leading-none mt-1">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-2xl border ${styles.bg} ${styles.text} ${styles.border} shadow-inner transition-transform duration-300 group-hover:scale-115`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom Section: Trend Indicator & Sparkline */}
      <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-gray-100/40 dark:border-gray-800/40">
        {/* Trend Percentage badge */}
        {trend ? (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${getTrendColor()}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        ) : (
          <div className="text-[10px] font-medium text-gray-450">
            Stable metrics
          </div>
        )}

        {/* Sparkline Graph */}
        <div className="w-20 h-7 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <linearGradient id={`grad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trendType === "up" ? "#10b981" : "#ef4444"} stopOpacity="0.25" />
                <stop offset="100%" stopColor={trendType === "up" ? "#10b981" : "#ef4444"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M ${padding},${height} L ${points} L ${width - padding},${height} Z`}
              fill={`url(#grad-${uniqueId})`}
            />
            <polyline
              fill="none"
              stroke={trendType === "up" ? "#10b981" : (trendType === "down" ? "#ef4444" : "#9ca3af")}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
