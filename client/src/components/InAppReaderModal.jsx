import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Type,
  ExternalLink,
  Download,
  Bookmark,
} from 'lucide-react';

export const InAppReaderModal = ({ isOpen, onClose, book }) => {
  const [theme, setTheme] = useState('dark'); // 'dark', 'light', 'sepia'
  const [fontSize, setFontSize] = useState('text-base'); // 'text-sm', 'text-base', 'text-lg', 'text-xl'
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen || !book) return null;

  const themes = {
    dark: 'bg-slate-900 text-slate-100 border-slate-800',
    light: 'bg-white text-slate-900 border-gray-200',
    sepia: 'bg-[#fbf0d9] text-[#5f4b32] border-[#ecd8b5]',
  };

  const contentThemes = {
    dark: 'text-slate-200',
    light: 'text-slate-800',
    sepia: 'text-[#483724]',
  };

  const getDownloadUrl = () => {
    if (book.eBookUrl && book.eBookUrl.startsWith('/uploads/')) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const rootUrl = apiBase.replace(/\/api$/, '');
      return `${rootUrl}${book.eBookUrl}`;
    }
    return book.eBookUrl;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className={`w-full ${
            isFullScreen ? 'h-full max-h-screen rounded-none' : 'max-w-4xl h-[90vh] rounded-2xl shadow-2xl'
          } flex flex-col border overflow-hidden ${themes[theme]} transition-colors duration-300`}
        >
          {/* Reader Top Bar */}
          <div className="flex flex-col gap-3 border-b border-inherit/40 bg-inherit px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex min-w-0 items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-500 flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} />
              </div>
              <div className="truncate">
                <h3 className="font-semibold text-sm sm:text-base truncate">{book.title}</h3>
                <p className="text-xs opacity-70 truncate">
                  {book.author} • Code: <span className="font-mono">{book.bookCode}</span>
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex w-full items-center justify-between gap-1 overflow-x-auto sm:w-auto sm:justify-end sm:gap-2">
              {/* Font size toggle */}
              <div className="hidden sm:flex items-center border border-inherit/30 rounded-lg p-1">
                <button
                  onClick={() => setFontSize('text-sm')}
                  className={`px-2 py-0.5 text-xs rounded ${fontSize === 'text-sm' ? 'bg-primary-600 text-white' : 'opacity-70'}`}
                  title="Small text"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('text-base')}
                  className={`px-2 py-0.5 text-xs rounded ${fontSize === 'text-base' ? 'bg-primary-600 text-white' : 'opacity-70'}`}
                  title="Default text"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('text-lg')}
                  className={`px-2 py-0.5 text-xs rounded ${fontSize === 'text-lg' ? 'bg-primary-600 text-white' : 'opacity-70'}`}
                  title="Large text"
                >
                  A+
                </button>
              </div>

              {/* Theme toggle */}
              <div className="flex items-center border border-inherit/30 rounded-lg p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded ${theme === 'light' ? 'bg-amber-100 text-amber-900' : 'opacity-70'}`}
                  title="Light Theme"
                >
                  <Sun size={14} />
                </button>
                <button
                  onClick={() => setTheme('sepia')}
                  className={`px-2 py-0.5 text-xs font-serif rounded ${theme === 'sepia' ? 'bg-[#e5d5b7] text-[#55402a]' : 'opacity-70'}`}
                  title="Sepia Theme"
                >
                  Sepia
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded ${theme === 'dark' ? 'bg-slate-700 text-white' : 'opacity-70'}`}
                  title="Dark Theme"
                >
                  <Moon size={14} />
                </button>
              </div>

              {/* Download or external button */}
              {book.eBookUrl && (
                <a
                  href={getDownloadUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-inherit/40 text-primary-500 hover:text-primary-400 transition-colors"
                  title="Download / Open Original Resource"
                >
                  {book.eBookType === 'pdf' ? <Download size={16} /> : <ExternalLink size={16} />}
                </a>
              )}

              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="hidden sm:inline-flex p-2 rounded-lg hover:bg-inherit/40 opacity-80 hover:opacity-100 transition-opacity"
                title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-red-500/20 text-inherit hover:text-red-500 transition-colors"
                title="Close Reader"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Reader Body Canvas */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 sm:py-12">
            <div className={`max-w-2xl mx-auto ${fontSize} leading-relaxed ${contentThemes[theme]}`}>
              {book.eBookContent ? (
                <div className="space-y-6">
                  {book.eBookContent.split('\n\n').map((paragraph, index) => {
                    const trimmed = paragraph.trim();
                    if (trimmed.startsWith('# ')) {
                      return (
                        <h1 key={index} className="text-3xl font-bold mb-4 font-serif text-inherit border-b border-inherit/20 pb-2">
                          {trimmed.replace('# ', '')}
                        </h1>
                      );
                    }
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-2xl font-semibold mt-6 mb-3 font-serif text-inherit">
                          {trimmed.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-xl font-medium mt-4 mb-2 font-serif text-inherit">
                          {trimmed.replace('### ', '')}
                        </h3>
                      );
                    }
                    return (
                      <p key={index} className="indent-4 sm:indent-8 text-justify opacity-95">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              ) : book.eBookUrl ? (
                <div className="text-center py-16 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary-600/10 text-primary-500 mx-auto flex items-center justify-center">
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Digital Resource Linked</h3>
                    <p className="opacity-80 max-w-md mx-auto text-sm">
                      This volume is hosted through our digital open collection. Click below to view the interactive live document or download the file.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={getDownloadUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg shadow-primary-500/25 transition-all"
                    >
                      <ExternalLink size={18} />
                      Open Live Document
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 opacity-60">
                  <Bookmark size={40} className="mx-auto mb-3 opacity-50" />
                  <p>No digital reading content found for this entry.</p>
                </div>
              )}
            </div>
          </div>

          {/* Reader Footer */}
          <div className="px-6 py-2.5 border-t border-inherit/40 flex items-center justify-between text-xs opacity-70 bg-inherit">
            <span>LibraryHub In-App Live Reader</span>
            <span>Book Code: {book.bookCode}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InAppReaderModal;
