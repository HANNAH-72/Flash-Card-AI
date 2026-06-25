import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import FlashcardCard from "../components/FlashcardCard";
import { CardSkeleton } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  X, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight,
  Brain,
  SlidersHorizontal,
  BookmarkCheck
} from "lucide-react";

const Flashcards = () => {
  const [cards, setCards] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isFavorite, setIsFavorite] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 6; // Display 6 cards per page

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedCard, setSelectedCard] = useState(null);
  const [formSubject, setFormSubject] = useState("");
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("Medium");
  
  const { addToast } = useToast();

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      
      let url = `/api/flashcards?skip=${skip}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (subject) url += `&subject=${encodeURIComponent(subject)}`;
      if (difficulty) url += `&difficulty=${difficulty}`;
      if (isFavorite !== null) url += `&is_favorite=${isFavorite}`;

      const res = await api.get(url);
      setCards(res.data.items || []);
      setTotalCount(res.data.total || 0);
      setSubjectsList(res.data.subjects || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch flashcards.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, subject, difficulty, isFavorite, addToast]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Handle resetting pagination on filter changes
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  // Toggle favorite API call
  const handleFavoriteToggle = async (card) => {
    try {
      const updatedCard = await api.put(`/api/flashcards/${card.id}`, {
        is_favorite: !card.is_favorite
      });
      setCards(prev => prev.map(c => c.id === card.id ? updatedCard.data : c));
      addToast(
        updatedCard.data.is_favorite 
          ? "Card added to favorites!" 
          : "Card removed from favorites.", 
        "info"
      );
    } catch (err) {
      console.error(err);
      addToast("Failed to update favorite status.", "error");
    }
  };

  // Delete Card API call
  const handleDeleteCard = async (card) => {
    if (!window.confirm("Are you sure you want to delete this flashcard?")) return;
    try {
      await api.delete(`/api/flashcards/${card.id}`);
      addToast("Flashcard successfully deleted.", "success");
      // Reload current page
      if (cards.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        fetchCards();
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to delete flashcard.", "error");
    }
  };

  // Open Modal Helper
  const openModal = (mode, card = null) => {
    setModalMode(mode);
    setSelectedCard(card);
    if (mode === "edit" && card) {
      setFormSubject(card.subject);
      setFormQuestion(card.question);
      setFormAnswer(card.answer);
      setFormDifficulty(card.difficulty);
    } else {
      setFormSubject("");
      setFormQuestion("");
      setFormAnswer("");
      setFormDifficulty("Medium");
    }
    setIsModalOpen(true);
  };

  // Handle Create or Edit Form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formSubject.trim() || !formQuestion.trim() || !formAnswer.trim()) {
      addToast("Please fill in all card fields.", "warning");
      return;
    }

    try {
      const cardPayload = {
        subject: formSubject.trim(),
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        difficulty: formDifficulty
      };

      if (modalMode === "add") {
        await api.post("/api/flashcards", cardPayload);
        addToast("Flashcard manually created!", "success");
        setPage(1);
      } else {
        await api.put(`/api/flashcards/${selectedCard.id}`, cardPayload);
        addToast("Flashcard updated successfully!", "success");
      }
      setIsModalOpen(false);
      fetchCards();
    } catch (err) {
      console.error(err);
      addToast("Failed to save flashcard.", "error");
    }
  };

  // Derived pages variables
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight leading-tight">
            My Flashcards
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage, filter, and customize your study cards.
          </p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/15 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Card Manually
        </button>
      </div>

      {/* Filters Dashboard Toolbar */}
      <div className="p-4 border bg-white/40 dark:bg-gray-900/40 rounded-2xl glass-panel space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Text Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-xs glass-input text-gray-900 dark:text-white"
              placeholder="Search cards..."
            />
          </div>

          {/* Subject Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <select
              value={subject}
              onChange={(e) => handleFilterChange(setSubject, e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-xs glass-input text-gray-700 dark:text-gray-300 appearance-none focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjectsList.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Brain className="w-4 h-4" />
            </span>
            <select
              value={difficulty}
              onChange={(e) => handleFilterChange(setDifficulty, e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-xs glass-input text-gray-700 dark:text-gray-300 appearance-none focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Favorites Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange(setIsFavorite, isFavorite === true ? null : true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold border rounded-xl transition-all duration-200 cursor-pointer ${
                isFavorite === true
                  ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 text-gray-500 dark:text-gray-400"
              }`}
            >
              <BookmarkCheck className="w-4.5 h-4.5" />
              Favorites Only
            </button>
            
            {(search || subject || difficulty || isFavorite !== null) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSubject("");
                  setDifficulty("");
                  setIsFavorite(null);
                  setPage(1);
                }}
                className="px-3.5 py-2.5 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl text-xs text-gray-500 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 font-bold transition-all cursor-pointer"
                title="Clear Filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Flashcard Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl border-gray-200 dark:border-gray-800">
          <Bookmark className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">No flashcards found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm text-center">
            Try adjusting your filters, or generate new cards from pasted text notes or PDF files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <FlashcardCard
              key={card.id}
              card={card}
              onFavoriteToggle={handleFavoriteToggle}
              onEdit={() => openModal("edit", card)}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalCount > limit && (
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-5">
          <p className="text-xs text-gray-400 font-semibold">
            Showing <span className="text-gray-900 dark:text-white">{(page - 1) * limit + 1}</span> to{" "}
            <span className="text-gray-900 dark:text-white">
              {Math.min(page * limit, totalCount)}
            </span>{" "}
            of <span className="text-gray-900 dark:text-white">{totalCount}</span> cards
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 border rounded-xl border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 border rounded-xl border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MANAGE MODAL: Add/Edit Card */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-lg p-6 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl space-y-6 z-10 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-950 dark:text-white font-heading">
                {modalMode === "add" ? "Add Flashcard" : "Edit Flashcard"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                  placeholder="e.g. Biology, Chemistry"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Difficulty Level
                </label>
                <select
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-700 dark:text-gray-300 appearance-none focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Question */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Question
                </label>
                <textarea
                  required
                  rows={3}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white leading-relaxed resize-none focus:outline-none"
                  placeholder="Enter flashcard question..."
                />
              </div>

              {/* Answer */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Answer
                </label>
                <textarea
                  required
                  rows={3}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white leading-relaxed resize-none focus:outline-none"
                  placeholder="Enter flashcard answer..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200/80 rounded-xl dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700/80 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/15 transition-all cursor-pointer text-center"
                >
                  {modalMode === "add" ? "Create Card" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
