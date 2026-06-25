import React from "react";

export const CardSkeleton = () => {
  return (
    <div className="w-full h-64 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 animate-pulse flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <div className="w-20 h-5 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="flex gap-2">
          <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="w-6 h-5 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center gap-2">
        <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
      <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
    </div>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 animate-pulse flex items-center justify-between">
      <div className="space-y-3">
        <div className="w-20 h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800"></div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 animate-pulse flex flex-col justify-between h-[300px]">
      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
      <div className="flex-1 flex items-end justify-between gap-4 mt-8">
        <div className="w-full h-1/3 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
        <div className="w-full h-2/3 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
        <div className="w-full h-1/2 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
        <div className="w-full h-3/4 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
        <div className="w-full h-1/4 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
      </div>
    </div>
  );
};

export const ListSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="w-36 h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
          <div className="w-16 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
};
