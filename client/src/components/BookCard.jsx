import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Eye, Download, Calendar, Layers, MapPin } from 'lucide-react';
import Button from './Button';

export const BookCard = ({
  book,
  onApplyBorrow,
  onReadLive,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const getDownloadUrl = () => {
    if (book.eBookUrl && book.eBookUrl.startsWith('/uploads/')) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const rootUrl = apiBase.replace(/\/api$/, '');
      return `${rootUrl}${book.eBookUrl}`;
    }
    return book.eBookUrl;
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="card h-full flex flex-col border border-primary-100/80 dark:border-slate-700/80 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
    >
      {/* Cover Image & Badges */}
      <div className="relative mb-3.5 overflow-hidden rounded-xl bg-primary-50 dark:bg-slate-700">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-52 object-cover object-center transition-transform duration-500 hover:scale-105"
        />

        {/* Book Code Pill */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white font-mono text-xs font-bold shadow-md border border-white/10">
          {book.bookCode}
        </div>

        {/* E-Content Badge */}
        {book.isEContent && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-primary-600/90 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-md">
            <Eye size={12} /> E-Content
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs text-primary-600 dark:text-primary-400 font-semibold mb-1">
          <span>{book.category}</span>
          <span className="text-gray-400 font-normal">{book.publicationYear}</span>
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1">
          {book.title}
        </h3>

        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
          by {book.author}
        </p>

        {/* Physical Status Indicator */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-700/70 space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-primary-500" />
              <span>Available Copies:</span>
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                book.availableCopies > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
              }`}
            >
              {book.availableCopies} / {book.totalCopies}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> Shelf:
            </span>
            <span className="font-mono text-gray-700 dark:text-gray-300 font-medium">
              {book.shelfLocation || 'General Rack'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="pt-4 flex flex-col gap-2">
            {/* E-Content Action Row */}
            {book.isEContent && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onReadLive && onReadLive(book)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye size={14} /> Read Live
                </button>
                {book.eBookUrl && (
                  <a
                    href={getDownloadUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
                    title="Download / External File"
                  >
                    <Download size={14} />
                  </a>
                )}
              </div>
            )}

            {/* Physical Borrow Action */}
            <Button
              size="sm"
              variant={book.availableCopies > 0 ? 'primary' : 'secondary'}
              disabled={book.availableCopies <= 0}
              onClick={() => onApplyBorrow && onApplyBorrow(book)}
              className="w-full text-xs font-bold py-2 shadow-sm"
            >
              <Calendar size={14} />
              {book.availableCopies > 0 ? 'Apply for Physical Borrow' : 'Physical Out of Stock'}
            </Button>

            {/* Admin edit/delete buttons if passed */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-slate-700">
                {onEdit && (
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onEdit(book)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button size="sm" variant="danger" className="flex-1 text-xs" onClick={() => onDelete(book._id)}>
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BookCard;
