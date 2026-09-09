import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  RotateCcw,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Eye,
  Download,
  Laptop,
  Library,
  KeyRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import Button from '../components/Button';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import InAppReaderModal from '../components/InAppReaderModal';
import PhysicalBorrowModal from '../components/PhysicalBorrowModal';
import AIAssistantWidget from '../components/AIAssistantWidget';
import { useAuth } from '../hooks/useAuth';
import transactionService from '../services/transactionService';
import bookService from '../services/bookService';

export const UserDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [digitalBooks, setDigitalBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('loans'); // 'loans', 'digital'
  const [loanStatusFilter, setLoanStatusFilter] = useState('all');

  // Quick Book Code lookup state
  const [quickCodeInput, setQuickCodeInput] = useState('');
  const [quickLookupBook, setQuickLookupBook] = useState(null);
  const [quickLookupLoading, setQuickLookupLoading] = useState(false);
  const [quickLookupError, setQuickLookupError] = useState('');

  // Modals
  const [selectedBookForReader, setSelectedBookForReader] = useState(null);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTransactions(), fetchDigitalBooks()]);
    } catch (err) {
      console.error('Error fetching user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getUserTransactions({ limit: 100 });
      setTransactions(response.transactions || []);
    } catch (err) {
      console.error('Error fetching user transactions:', err);
    }
  };

  const fetchDigitalBooks = async () => {
    try {
      const res = await bookService.getAllBooks({ eContentOnly: true, limit: 50 });
      setDigitalBooks(res.books || []);
    } catch (err) {
      console.error('Error fetching digital books:', err);
    }
  };

  // Quick lookup by Book Code
  const handleQuickLookup = async (e) => {
    e.preventDefault();
    if (!quickCodeInput.trim()) return;
    setQuickLookupLoading(true);
    setQuickLookupError('');
    setQuickLookupBook(null);

    try {
      const res = await bookService.getBookByCode(quickCodeInput.trim());
      if (res.success && res.book) {
        setQuickLookupBook(res.book);
      }
    } catch (err) {
      setQuickLookupError(err.message || 'Book not found with this Book Code');
    } finally {
      setQuickLookupLoading(false);
    }
  };

  // Calculation helpers
  const isOverdue = (dueDate) => new Date(dueDate) < new Date();
  const daysUntilDue = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const activeIssued = transactions.filter((t) => t.status === 'issued');
  const pendingRequests = transactions.filter((t) => t.status === 'pending');
  const completedReturns = transactions.filter((t) => t.status === 'returned');
  const overdueLoans = transactions.filter(
    (t) => t.status === 'issued' && t.dueDate && isOverdue(t.dueDate)
  );

  const filteredLoans = transactions.filter((t) => {
    if (loanStatusFilter === 'all') return true;
    if (loanStatusFilter === 'overdue') return t.status === 'issued' && isOverdue(t.dueDate);
    return t.status === loanStatusFilter;
  });

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-700 to-primary-900 text-white shadow-xl shadow-primary-900/15">
          <div className="space-y-1">
            <span className="px-2.5 py-1 rounded-md bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              Member Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              Welcome Back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-primary-100 max-w-xl">
              Manage your physical library borrow applications, track intake & return deadlines, or access our digital open reader.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = '/books')}
              className="bg-white text-primary-700 hover:bg-primary-50 font-bold"
            >
              Browse Catalog
            </Button>
          </div>
        </div>

        {/* Quick Apply by Book Code Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  Quick Apply by Book Code
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Know the code? Enter it directly (e.g. <code>BK-1001</code>) to apply in seconds!
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickLookup} className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Enter Book Code (e.g., BK-1001)"
                value={quickCodeInput}
                onChange={(e) => setQuickCodeInput(e.target.value.toUpperCase())}
                className="text-xs sm:text-sm font-mono font-bold uppercase rounded-xl flex-1"
                required
              />
              <Button size="sm" type="submit" loading={quickLookupLoading}>
                <Search size={16} /> Lookup
              </Button>
            </form>
          </div>

          {/* Quick Lookup Result Card */}
          {quickLookupError && (
            <p className="text-xs text-red-500 mt-3 font-semibold">{quickLookupError}</p>
          )}

          {quickLookupBook && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-primary-50 dark:bg-slate-700/50 border border-primary-100 dark:border-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={quickLookupBook.coverImage}
                  alt={quickLookupBook.title}
                  className="w-12 h-16 object-cover rounded-lg shadow-sm"
                />
                <div>
                  <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
                    {quickLookupBook.bookCode}
                  </span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{quickLookupBook.title}</h4>
                  <p className="text-xs text-gray-500">by {quickLookupBook.author} • {quickLookupBook.availableCopies} physical copies available</p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {quickLookupBook.isEContent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedBookForReader(quickLookupBook)}
                    className="text-xs"
                  >
                    <Eye size={14} /> Read Live
                  </Button>
                )}
                <Button
                  size="sm"
                  disabled={quickLookupBook.availableCopies <= 0}
                  onClick={() => setSelectedBookForBorrow(quickLookupBook)}
                  className="text-xs"
                >
                  <Calendar size={14} /> Apply to Borrow
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* 4 STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="card border border-primary-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Active Loans</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{activeIssued.length}</span>
              <BookOpen size={20} className="text-primary-500 opacity-60" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Physically in your possession</p>
          </div>

          <div className="card border border-primary-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Pending Applications</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{pendingRequests.length}</span>
              <Clock size={20} className="text-primary-500 opacity-60" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Awaiting librarian review</p>
          </div>

          <div className="card border border-primary-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Returned Books</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{completedReturns.length}</span>
              <RotateCcw size={20} className="text-primary-500 opacity-60" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Successfully returned</p>
          </div>

          <div className="card border border-primary-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Overdue Books</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{overdueLoans.length}</span>
              <AlertCircle size={20} className="text-primary-500 opacity-60" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Past scheduled return date</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 overflow-x-auto border-b border-gray-200 dark:border-slate-700 pb-2">
          <button
            onClick={() => setActiveTab('loans')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'loans'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Library size={18} />
            Physical Loans & Borrow Applications ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('digital')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'digital'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Laptop size={18} />
            Digital Reading Room (E-Content)
          </button>
        </div>

        {/* TAB 1: PHYSICAL LOANS & APPLICATIONS */}
        {activeTab === 'loans' && (
          <div className="space-y-4">
            {/* Status filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All History' },
                { id: 'issued', label: `Currently Issued (${activeIssued.length})` },
                { id: 'pending', label: `Pending Approval (${pendingRequests.length})` },
                { id: 'returned', label: `Returned (${completedReturns.length})` },
                { id: 'overdue', label: `Overdue (${overdueLoans.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setLoanStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    loanStatusFilter === f.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <Loading message="Loading your borrow records..." />
            ) : filteredLoans.length > 0 ? (
              <div className="card overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-400 uppercase text-[11px]">
                      <th className="py-3 px-3">Book Details</th>
                      <th className="py-3 px-3">Book Code</th>
                      <th className="py-3 px-3">Intake Date</th>
                      <th className="py-3 px-3">Due / Return Date</th>
                      <th className="py-3 px-3">Current Status</th>
                      <th className="py-3 px-3">Librarian Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                    {filteredLoans.map((trans) => {
                      const overdue = trans.status === 'issued' && trans.dueDate && isOverdue(trans.dueDate);
                      const daysLeft = trans.dueDate ? daysUntilDue(trans.dueDate) : 0;

                      return (
                        <tr key={trans._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40">
                          <td className="py-3 px-3 font-medium">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {trans.bookTitle || trans.book?.title}
                            </p>
                            <p className="text-xs text-gray-500">{trans.book?.author}</p>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-primary-600 dark:text-primary-400">
                            {trans.bookCode || trans.book?.bookCode}
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                            {trans.issueDate
                              ? new Date(trans.issueDate).toLocaleDateString()
                              : trans.requestFromDate
                              ? `Requested: ${new Date(trans.requestFromDate).toLocaleDateString()}`
                              : 'Pending'}
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                            {trans.returnDate ? (
                              <span className="text-emerald-600 font-medium">
                                Returned: {new Date(trans.returnDate).toLocaleDateString()}
                              </span>
                            ) : trans.dueDate ? (
                              <span>
                                {new Date(trans.dueDate).toLocaleDateString()}
                                {trans.status === 'issued' && (
                                  <span className={`block text-[11px] font-bold ${overdue ? 'text-red-500' : 'text-primary-600'}`}>
                                    {overdue ? `${Math.abs(daysLeft)}d Overdue` : `${daysLeft}d left`}
                                  </span>
                                )}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {trans.status === 'returned' ? (
                              <span className="badge badge-success">Returned</span>
                            ) : overdue ? (
                              <span className="badge badge-danger">Overdue</span>
                            ) : trans.status === 'issued' ? (
                              <span className="badge badge-primary">Active Loan</span>
                            ) : trans.status === 'approved' ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                Approved (Ready for Pickup)
                              </span>
                            ) : trans.status === 'rejected' ? (
                              <span className="badge badge-danger">Rejected</span>
                            ) : (
                              <span className="badge badge-warning">Pending Review</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-xs text-gray-500 italic">
                            {trans.librarianNotes || 'None'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No Borrow Records"
                message="You have no transactions matching this filter. Browse books to apply for a physical borrow!"
              />
            )}
          </div>
        )}

        {/* TAB 2: DIGITAL READING ROOM */}
        {activeTab === 'digital' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-2">Digital Open Library Collection</h3>
              <p className="text-xs text-gray-500 mb-6">
                Read directly in your browser with our in-app live reader or download files for offline study.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {digitalBooks.map((book) => (
                  <div
                    key={book._id}
                    className="p-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/60 flex flex-col justify-between space-y-4"
                  >
                    <div className="flex gap-3">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded-xl shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-primary-600 block">
                          {book.bookCode}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2">
                          {book.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                          Format: {book.eBookType || 'digital'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                      <button
                        onClick={() => setSelectedBookForReader(book)}
                        className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <Eye size={14} /> Read Live
                      </button>
                      {book.eBookUrl && (
                        <a
                          href={
                            book.eBookUrl.startsWith('/uploads/')
                              ? `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${book.eBookUrl}`
                              : book.eBookUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
                          title="Download"
                        >
                          <Download size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <InAppReaderModal
        isOpen={Boolean(selectedBookForReader)}
        onClose={() => setSelectedBookForReader(null)}
        book={selectedBookForReader}
      />

      <PhysicalBorrowModal
        isOpen={Boolean(selectedBookForBorrow)}
        onClose={() => {
          setSelectedBookForBorrow(null);
          setQuickLookupBook(null);
        }}
        book={selectedBookForBorrow}
        onSuccess={() => fetchTransactions()}
      />

      {/* INTERACTIVE AI ASSISTANT FLOATING BOT */}
      <AIAssistantWidget />
    </PublicLayout>
  );
};

export default UserDashboard;
