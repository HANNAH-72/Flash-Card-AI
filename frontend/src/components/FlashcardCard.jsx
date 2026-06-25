import React, { useState } from "react";
import { Heart, Star, Edit, Trash2, Eye } from "lucide-react";

const FlashcardCard = ({ 
  card, 
  onFavoriteToggle, 
  onEdit, 
  onDelete, 
  showControls = true,
  isFlippedOverride = null, // Can force flip from parent
  onCardClick = null
}) => {
  const [localFlipped, setLocalFlipped] = useState(false);
  const isFlipped = isFlippedOverride !== null ? isFlippedOverride : localFlipped;

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    } else {
      setLocalFlipped(!localFlipped);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      case "Hard":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      case "Medium":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
    }
  };

  return (
    <div className="relative w-full h-64 perspective-1000">
      {/* Flipping wrapper */}
      <div
        onClick={handleCardClick}
        className={`relative w-full h-full cursor-pointer transform-style-3d flip-transition ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* --- FRONT SIDE --- */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 rounded-2xl border backface-hidden glass-card">
          <div className="flex items-center justify-between">
            {/* Subject Label */}
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30">
              {card.subject}
            </span>
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {/* Difficulty Label */}
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getDifficultyColor(card.difficulty)}`}>
                {card.difficulty}
              </span>
              
              {/* Favorite Button */}
              {onFavoriteToggle && (
                <button
                  onClick={() => onFavoriteToggle(card)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      card.is_favorite 
                        ? "fill-rose-500 text-rose-500" 
                        : "text-gray-400 dark:text-gray-500 hover:text-rose-500"
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white text-center leading-relaxed max-h-[120px] overflow-y-auto pr-1">
              {card.question}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mt-2">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Click card to reveal answer
            </span>
            {showControls && (onEdit || onDelete) && (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <button
                    onClick={() => onEdit(card)}
                    className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(card)}
                    className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- BACK SIDE --- */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 rounded-2xl border rotate-y-180 backface-hidden glass-card">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30">
              {card.subject}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Answer
            </span>
          </div>

          {/* Answer Text */}
          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 text-center leading-relaxed max-h-[120px] overflow-y-auto pr-1">
              {card.answer}
            </p>
          </div>

          <div className="flex justify-between items-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
            <span>Click again to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardCard;
