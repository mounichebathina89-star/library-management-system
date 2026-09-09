import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Layers,
  Laptop,
  Library,
  Sparkles,
  Eye,
  KeyRound,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import Button from '../components/Button';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import InAppReaderModal from '../components/InAppReaderModal';
import PhysicalBorrowModal from '../components/PhysicalBorrowModal';
import AIAssistantWidget from '../components/AIAssistantWidget';
import PublicLayout from '../layouts/PublicLayout';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import bookService from '../services/bookService';

export const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all'); // 'all', 'econtent', 'physical'
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);

  // Modals state
  const [selectedBookForReader, setSelectedBookForReader] = useState(null);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null);

  const { isAuthenticated } = useAuth();
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    fetchBooks();
  }, [debouncedSearch, category, moduleFilter, page]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch,
        category: category === 'All' ? '' : category,
        page,
        limit: 12,
      };

      if (moduleFilter === 'econtent') {
        params.eContentOnly = true;
      }

      const response = await bookService.getAllBooks(params);
      let fetchedBooks = response.books || [];

      if (moduleFilter === 'physical') {
        fetchedBooks = fetchedBooks.filter((b) => b.totalCopies > 0);
      }

      setBooks(fetchedBooks);
      setTotal(response.total || 0);

      if (response.books) {
        const uniqueCategories = [...new Set(response.books.map((b) => b.category))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBorrow = (book) => {
    if (!isAuthenticated) {
      alert('Please sign in to submit a physical book borrow application.');
      window.location.href = '/login';
      return;
    }
    setSelectedBookForBorrow(book);
  };

  const handleReadLive = (book) => {
    setSelectedBookForReader(book);
  };

  const pages = Math.ceil(total / 12);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-semibold">
            <Library size={14} /> Comprehensive Catalog & Digital Repository
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white">
            Explore Books & Open E-Content
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Search with <strong>Book Name</strong>, <strong>Author</strong>, or <strong>Book Code</strong> (e.g. <code>BK-1001</code>). Read digital works live or reserve physical library copies.
          </p>
        </div>

        {/* Dual Module Toggle Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex max-w-full overflow-x-auto p-1.5 rounded-2xl bg-primary-50/80 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => { setModuleFilter('all'); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                moduleFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Layers size={16} />
              All Books
            </button>

            <button
              onClick={() => { setModuleFilter('econtent'); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                moduleFilter === 'econtent'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Laptop size={16} />
              Open Digital Library (E-Content)
            </button>

            <button
              onClick={() => { setModuleFilter('physical'); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                moduleFilter === 'physical'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Library size={16} />
              Physical Library Stacks
            </button>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by Book Name, Author, or Book Code (e.g., BK-1001)..."
              />
            </div>

            {/* Quick Book Code search pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50/70 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 text-xs">
              <KeyRound size={16} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-300">Tip: Type <code>BK-1001</code> to jump to any volume!</span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => { setCategory(''); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === ''
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  category === cat
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <Loading message="Fetching books from library catalog..." />
        ) : books.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {books.map((book, idx) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <BookCard
                    book={book}
                    onReadLive={handleReadLive}
                    onApplyBorrow={handleApplyBorrow}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors ${
                      page === p
                        ? 'bg-primary-600 text-white shadow'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No Books Found"
            message="No books matched your search or category filter. Try clearing filters or searching for another title."
          />
        )}
      </div>

      {/* IN-APP READER MODAL */}
      <InAppReaderModal
        isOpen={Boolean(selectedBookForReader)}
        onClose={() => setSelectedBookForReader(null)}
        book={selectedBookForReader}
      />

      {/* PHYSICAL BORROW APPLICATION MODAL */}
      <PhysicalBorrowModal
        isOpen={Boolean(selectedBookForBorrow)}
        onClose={() => setSelectedBookForBorrow(null)}
        book={selectedBookForBorrow}
        onSuccess={() => fetchBooks()}
      />

      {/* INTERACTIVE AI LIBRARY ASSISTANT FLOATING BOT */}
      <AIAssistantWidget />
    </PublicLayout>
  );
};

export default Books;
