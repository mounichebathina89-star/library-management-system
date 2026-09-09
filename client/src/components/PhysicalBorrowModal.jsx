import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, BookOpen, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Button from './Button';
import transactionService from '../services/transactionService';

export const PhysicalBorrowModal = ({ isOpen, onClose, book, onSuccess }) => {
  const [fromDate, setFromDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !book) return null;

  // Calculate borrow duration in days
  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;
    const diff = new Date(toDate) - new Date(fromDate);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (new Date(toDate) < new Date(fromDate)) {
      setError('To Date cannot be earlier than From Date');
      setLoading(false);
      return;
    }

    try {
      const response = await transactionService.applyForBook({
        bookCode: book.bookCode,
        bookId: book._id,
        fromDate,
        toDate,
        notes,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit physical borrow request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="my-3 max-h-[calc(100vh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:my-0 sm:max-h-[calc(100vh-2rem)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <h2 className="text-lg font-bold">Physical Borrow Application</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {success ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 size={48} className="mx-auto text-green-500 animate-bounce" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Application Submitted!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The librarian will review your request. You can track its status in your dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Book Summary Card */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 flex gap-4 items-center">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-16 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base truncate">{book.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{book.author}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-mono font-semibold">
                        Code: {book.bookCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">
                        {book.availableCopies} available
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        📍 {book.shelfLocation || 'Main Hall'}
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Dates grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary-500" />
                      Intake Date (From)
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFromDate(e.target.value)}
                      required
                      className="w-full text-sm rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary-500" />
                      Expected Return (To)
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setToDate(e.target.value)}
                      required
                      className="w-full text-sm rounded-lg"
                    />
                  </div>
                </div>

                {/* Duration indicator */}
                <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> Requested Borrow Duration:
                  </span>
                  <span className="font-bold">{calculateDays()} Days</span>
                </div>

                {/* Optional note */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Purpose / Notes for Librarian (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Required for final year thesis research..."
                    className="w-full text-sm rounded-lg"
                  />
                </div>

                {/* Footer Buttons */}
                  <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                  <Button variant="secondary" size="sm" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" loading={loading}>
                    Submit Application
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PhysicalBorrowModal;
