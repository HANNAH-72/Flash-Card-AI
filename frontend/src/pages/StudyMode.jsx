import React, { useEffect, useState } from "react";
import api from "../services/api";
import FlashcardCard from "../components/FlashcardCard";
import { CardSkeleton } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import { 
  BookOpen, 
  Sparkles, 
  Flame, 
  Trophy, 
  RotateCcw, 
  GraduationCap, 
  ThumbsUp, 
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

const StudyMode = () => {
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Selection state
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // Session tracking
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0); // Easy/Medium count
  const [streak, setStreak] = useState(0);
  
  const { addToast } = useToast();

  // Load subject headers list for startup dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/api/flashcards?limit=1");
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Error loading subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  const startSession = async () => {
    try {
      setLoading(true);
      setCompleted(false);
      setCurrentIndex(0);
      setSessionReviewed(0);
      setSessionCorrect(0);
      setIsFlipped(false);
      
      // Fetch only due reviews (or all cards in the subject if none are specifically due)
      let url = "/api/flashcards?due_only=true";
      if (selectedSubject) {
        url += `&subject=${encodeURIComponent(selectedSubject)}`;
      }
      
      const res = await api.get(url);
      let studyCards = res.data.items || [];
      
      // If there are no due cards, fallback to loading all cards in this category to avoid empty states
      if (studyCards.length === 0) {
        let fallbackUrl = "/api/flashcards?limit=50";
        if (selectedSubject) {
          fallbackUrl += `&subject=${encodeURIComponent(selectedSubject)}`;
        }
        const fallbackRes = await api.get(fallbackUrl);
        studyCards = fallbackRes.data.items || [];
        if (studyCards.length > 0) {
          addToast("No scheduled cards due today! Loading all cards to study.", "info");
        }
      }
      
      if (studyCards.length === 0) {
        addToast("No flashcards available in this category yet. Please generate some!", "warning");
      } else {
        setDeck(studyCards);
        setStarted(true);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to launch study session.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    const currentCard = deck[currentIndex];
    
    // Track stats
    setSessionReviewed(prev => prev + 1);
    if (rating === "Easy" || rating === "Medium") {
      setSessionCorrect(prev => prev + 1);
    }

    try {
      // 1. Submit review to backend (schedules spaced repetition)
      await api.post("/api/reviews", {
        flashcard_id: currentCard.id,
        difficulty: rating
      });
      
    } catch (err) {
      console.error("Failed to log review to backend:", err);
    }

    // Move to next card or trigger finish
    if (currentIndex + 1 < deck.length) {
      setIsFlipped(false);
      // Wait for flip transition to complete before updating text
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 250);
    } else {
      // End of deck, complete session
      finishSession();
    }
  };

  const finishSession = async () => {
    setCompleted(true);
    setStarted(false);
    
    const finalReviewed = sessionReviewed + 1; // including the current one
    const finalCorrect = sessionCorrect + (isFlipped && (deck[currentIndex]?.difficulty !== "Hard") ? 1 : 0);
    const accuracy = Math.round((finalCorrect / finalReviewed) * 100);
    
    try {
      // Send study session result to backend to save accuracy and log streaks
      const res = await api.post("/api/reviews/session", {
        total_reviewed: finalReviewed,
        accuracy: accuracy
      });
      
      // Load updated streak info
      const analyticsRes = await api.get("/api/analytics");
      setStreak(analyticsRes.data.study_streak || 0);
      addToast("Study session completed and synced!", "success");
    } catch (err) {
      console.error("Error saving study session:", err);
      addToast("Failed to save study session data.", "error");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-2xl mx-auto">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight leading-tight">
          Study Mode
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review flashcards using scheduled spaced repetition intervals.
        </p>
      </div>

      {/* 1. SELECTION SCREEN */}
      {!started && !completed && (
        <div className="p-6 border bg-white/40 dark:bg-gray-900/40 rounded-3xl glass-panel space-y-6 text-center">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full w-16 h-16 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
              Ready to learn?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a specific subject deck or select "Study All" to review all cards due according to scheduling intervals.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-700 dark:text-gray-300 appearance-none focus:outline-none"
            >
              <option value="">Study All Due Decks</option>
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <button
              onClick={startSession}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
            >
              Start Study Session
            </button>
          </div>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {loading && (
        <div className="space-y-6">
          <CardSkeleton />
        </div>
      )}

      {/* 3. ACTIVE SESSION STATE */}
      {started && !loading && deck.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Progress Header */}
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
            <span>Card {currentIndex + 1} of {deck.length}</span>
            <span className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
              {deck[currentIndex].subject}
            </span>
          </div>

          {/* Flashcard Component */}
          <FlashcardCard 
            card={deck[currentIndex]} 
            showControls={false} 
            isFlippedOverride={isFlipped}
            onCardClick={() => setIsFlipped(!isFlipped)}
          />

          {/* Action Control Buttons */}
          <div className="flex flex-col gap-4 text-center">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="w-full py-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
              >
                Reveal Answer
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Rate your recall difficulty:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRating("Hard")}
                    className="py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/20 transition-all cursor-pointer"
                  >
                    Hard (1 Day)
                  </button>
                  <button
                    onClick={() => handleRating("Medium")}
                    className="py-3 px-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-all cursor-pointer"
                  >
                    Medium (2 Days)
                  </button>
                  <button
                    onClick={() => handleRating("Easy")}
                    className="py-3 px-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all cursor-pointer"
                  >
                    Easy (5 Days)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. COMPLETED SCREEN */}
      {completed && (
        <div className="p-8 border bg-white/40 dark:bg-gray-900/40 rounded-3xl glass-panel space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading">
              Session Completed!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Outstanding work! You reviewed {sessionReviewed} cards this session. Your memory is strengthening.
            </p>
          </div>

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-500/10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Session Accuracy
              </span>
              <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-heading">
                {Math.round((sessionCorrect / sessionReviewed) * 100) || 0}%
              </span>
            </div>
            
            <div className="p-4 rounded-2xl bg-orange-50/30 dark:bg-orange-950/10 border border-orange-500/10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Study Streak
              </span>
              <span className="text-xl font-black text-orange-600 dark:text-orange-400 font-heading flex items-center justify-center gap-1.5">
                <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
                {streak} Days
              </span>
            </div>
          </div>

          <div className="flex gap-3 max-w-xs mx-auto pt-4">
            <button
              onClick={() => {
                setCompleted(false);
                setStarted(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200/80 rounded-xl dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700/80 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Decks
            </button>
            <Link
              to="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/15 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMode;
