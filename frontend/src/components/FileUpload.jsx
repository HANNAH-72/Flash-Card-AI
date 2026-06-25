import React, { useRef, useState } from "react";
import { Upload, FileText, X, AlertCircle, Check } from "lucide-react";

const FileUpload = ({ onFileSelect, selectedFile, onClear, isLoading, uploadProgress }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (file) => {
    if (!file) return false;
    
    // Check if PDF
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Only PDF documents are supported.");
      return false;
    }
    
    // Check size (Max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File is too large. Maximum size allowed is 10MB.");
      return false;
    }
    
    setError("");
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        // Drag Zone
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`flex flex-col items-center justify-center w-full min-h-[220px] p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-indigo-600 bg-indigo-50/20 dark:border-indigo-400 dark:bg-indigo-950/10"
              : "border-gray-300 hover:border-indigo-500 dark:border-gray-700 dark:hover:border-indigo-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleChange}
            disabled={isLoading}
          />
          
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full mb-4 text-indigo-600 dark:text-indigo-400">
            <Upload className="w-8 h-8" />
          </div>
          
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Drag & drop your study notes here, or <span className="text-indigo-600 dark:text-indigo-400 hover:underline">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Only PDF files are accepted (Max 10MB)
          </p>

          {error && (
            <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      ) : (
        // File Preview Info Card
        <div className="flex flex-col gap-4 p-4 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-rose-600 dark:text-rose-400">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white max-w-[200px] sm:max-w-[400px] truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
            </div>
            
            {!isLoading && (
              <button
                onClick={onClear}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Upload Progress Bar if processing */}
          {isLoading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-400">
                <span>Extracting & generating flashcards...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
