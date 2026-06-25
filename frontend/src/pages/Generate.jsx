import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { 
  Sparkles, 
  FileText, 
  BookOpen, 
  Loader2, 
  Check, 
  Brain,
  Layers
} from "lucide-react";

const Generate = () => {
  const [activeTab, setActiveTab] = useState("text"); // 'text' or 'pdf'
  const [notesText, setNotesText] = useState("");
  const [subject, setSubject] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedCards, setGeneratedCards] = useState([]);
  
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleTextGenerate = async (e) => {
    e.preventDefault();
    if (!notesText.trim() || notesText.split(/\s+/).length < 5) {
      addToast("Please provide more detailed study notes (minimum 5 words).", "warning");
      return;
    }

    setIsLoading(true);
    setGeneratedCards([]);
    try {
      const res = await api.post("/api/flashcards/generate", {
        notes: notesText,
        subject: subject.trim() || "General",
      });
      
      setGeneratedCards(res.data);
      addToast(`Successfully generated ${res.data.length} flashcards!`, "success");
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Could not generate flashcards. Please write clearer content.";
      addToast(detail, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfGenerate = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      addToast("Please upload a PDF file first.", "warning");
      return;
    }

    setIsLoading(true);
    setGeneratedCards([]);
    setUploadProgress(10); // Start mock progress indicator
    
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("subject", subject.trim() || "General");

      // Progress intervals for UI feedback
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 15;
        });
      }, 500);

      const res = await api.post("/api/flashcards/generate/pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(progressTimer);
      setUploadProgress(100);
      
      setTimeout(() => {
        setGeneratedCards(res.data);
        addToast(`Successfully generated ${res.data.length} flashcards from PDF!`, "success");
        setIsLoading(false);
      }, 400);

    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Could not extract or process text from PDF.";
      addToast(detail, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-4xl mx-auto">
      {/* Title banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight leading-tight">
          AI Flashcard Generator
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload text guides or study PDFs. Our local NLP extracts core definitions and concepts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form Controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Custom Tabs Selector */}
          <div className="flex gap-2 p-1 border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-950/40 rounded-2xl">
            <button
              onClick={() => {
                if (!isLoading) {
                  setActiveTab("text");
                  setGeneratedCards([]);
                }
              }}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "text"
                  ? "bg-indigo-600 text-white shadow-md dark:bg-indigo-600/90"
                  : "text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100/50 dark:hover:bg-gray-900/20"
              }`}
            >
              <FileText className="w-4 h-4" />
              Paste Study Text
            </button>
            <button
              onClick={() => {
                if (!isLoading) {
                  setActiveTab("pdf");
                  setGeneratedCards([]);
                }
              }}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "pdf"
                  ? "bg-indigo-600 text-white shadow-md dark:bg-indigo-600/90"
                  : "text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100/50 dark:hover:bg-gray-900/20"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Upload PDF
            </button>
          </div>

          {/* Form Container */}
          <div className="p-6 border bg-white/40 dark:bg-gray-900/40 rounded-3xl glass-panel space-y-6">
            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Deck Subject (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white"
                placeholder="e.g., Photosynthesis, Organic Chemistry, Algorithms"
                disabled={isLoading}
              />
            </div>

            {activeTab === "text" ? (
              // Paste Text Box Form
              <form onSubmit={handleTextGenerate} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Pasted Notes
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950 text-sm glass-input text-gray-900 dark:text-white leading-relaxed resize-none focus:outline-none"
                    placeholder="Paste your textbook chapters, study summaries, or lecture logs here. For example: Photosynthesis is the process by which green plants prepare food using sunlight..."
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !notesText.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-75 disabled:hover:bg-indigo-600 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Flashcards...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Flashcards
                    </>
                  )}
                </button>
              </form>
            ) : (
              // PDF Document Upload Form
              <form onSubmit={handlePdfGenerate} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    PDF Document File
                  </label>
                  <FileUpload
                    onFileSelect={(file) => setPdfFile(file)}
                    selectedFile={pdfFile}
                    onClear={() => setPdfFile(null)}
                    isLoading={isLoading}
                    uploadProgress={uploadProgress}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !pdfFile}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-75 disabled:hover:bg-indigo-600 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing PDF...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Extract & Generate
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Generation Tips */}
        <div className="space-y-6">
          <div className="p-6 border border-gray-100 dark:border-gray-800 bg-indigo-500/5 dark:bg-indigo-950/10 rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
              NLP Engine Rules
            </h3>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium list-disc list-inside">
              <li>Our engine checks nouns and predicates to build factual questions.</li>
              <li>Sentences containing copula terms (is, are, defined as) produce direct definition questions.</li>
              <li>Readability metrics automatically classify cards into Easy, Medium, or Hard difficulty levels.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generated Cards Preview Area */}
      {generatedCards.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-900 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-950 dark:text-white font-heading flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" /> Generated Cards ({generatedCards.length})
            </h2>
            <button
              onClick={() => navigate("/study")}
              className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer"
            >
              Start Studying Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {generatedCards.map((card) => (
              <div
                key={card.id}
                className="p-5 border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 rounded-2xl glass-card flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-md">
                    {card.subject}
                  </span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-3 leading-relaxed">
                    Q: {card.question}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    A: {card.answer}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                  <span>Difficulty: {card.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Generate;
