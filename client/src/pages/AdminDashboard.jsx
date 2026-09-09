import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  Users,
  History,
  AlertTriangle,
  Plus,
  Search,
  Trash2,
  Edit,
  Check,
  X,
  Sparkles,
  Brain,
  Bot,
  Send,
  Calendar,
  Clock,
  Download,
  Eye,
  ExternalLink,
  RefreshCw,
  Layers,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import Button from '../components/Button';
import Modal from '../components/Modal';
import InAppReaderModal from '../components/InAppReaderModal';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import bookService from '../services/bookService';
import transactionService from '../services/transactionService';
import aiService from '../services/aiService';

export const AdminDashboard = ({ defaultTab = 'analytics' }) => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, defaultTab]);

  // AI State
  const [aiAnalytics, setAiAnalytics] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([
    {
      role: 'assistant',
      content:
        'Greetings, Head Librarian! 🤖 I am your **AI Copilot**. Ask me anything regarding catalog optimization, overdue mitigation strategies, or collection development analysis.',
    },
  ]);

  // Books State
  const [books, setBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategory, setBookCategory] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [previewBook, setPreviewBook] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    bookCode: '',
    isbn: '',
    category: 'Fiction',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    totalCopies: 5,
    shelfLocation: 'Rack A1',
    description: '',
    coverImage: '',
    isEContent: false,
    eBookType: 'text',
    eBookUrl: '',
    eBookContent: '',
  });
  const [bookFile, setBookFile] = useState(null);
  const [bookActionLoading, setBookActionLoading] = useState(false);

  // Circulation & Direct Intake State
  const [transactions, setTransactions] = useState([]);
  const [circulationFilter, setCirculationFilter] = useState('all');
  const [directIntakeData, setDirectIntakeData] = useState({
    bookCode: '',
    userName: '',
    userEmail: '',
    userPhone: '',
    intakeTime: new Date().toISOString().slice(0, 16),
    returnDateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().slice(0, 16);
    })(),
    notes: '',
  });
  const [directIntakeLoading, setDirectIntakeLoading] = useState(false);

  // Users State
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchBooks(),
        fetchTransactions(),
        fetchUsers(),
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await userService.getDashboardStats();
      setStats(response);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await bookService.getAllBooks({ limit: 100 });
      setBooks(res.books || []);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await transactionService.getTransactions({ limit: 100 });
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      setAllUsers(res.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // 1. AI Analytics Generation
  const handleGenerateAiAnalytics = async () => {
    setAiLoading(true);
    try {
      const res = await aiService.getLibrarianAnalytics();
      if (res.success && res.analytics) {
        setAiAnalytics(res.analytics);
      }
    } catch (err) {
      console.error('Failed to generate AI analytics:', err);
      alert('Could not generate AI report. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // 2. AI Copilot Chat
  const handleSendCopilot = async (e) => {
    e.preventDefault();
    if (!copilotQuery.trim() || copilotLoading) return;

    const userMsg = { role: 'user', content: copilotQuery.trim() };
    setCopilotMessages((prev) => [...prev, userMsg]);
    setCopilotQuery('');
    setCopilotLoading(true);

    try {
      const history = copilotMessages.slice(-4);
      const res = await aiService.askLibrarianCopilot(userMsg.content, history);
      if (res.success && res.reply) {
        setCopilotMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      }
    } catch (err) {
      setCopilotMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Encountered an issue communicating with Groq AI engine.' },
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // 3. Book Add/Edit Handler
  const handleSaveBook = async (e) => {
    e.preventDefault();
    setBookActionLoading(true);

    try {
      let payload;
      if (bookFile) {
        payload = new FormData();
        Object.keys(bookFormData).forEach((key) => {
          payload.append(key, bookFormData[key]);
        });
        payload.append('bookFile', bookFile);
      } else {
        payload = { ...bookFormData };
      }

      if (editingBook) {
        await bookService.updateBook(editingBook._id, payload);
        alert('Book updated successfully!');
      } else {
        await bookService.addBook(payload);
        alert('Book added successfully to catalog!');
      }

      setShowAddBookModal(false);
      setEditingBook(null);
      setBookFile(null);
      resetBookForm();
      fetchBooks();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to save book');
    } finally {
      setBookActionLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await bookService.deleteBook(bookId);
      fetchBooks();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to delete book');
    }
  };

  const resetBookForm = () => {
    setBookFormData({
      title: '',
      author: '',
      bookCode: '',
      isbn: '',
      category: 'Fiction',
      publisher: '',
      publicationYear: new Date().getFullYear(),
      totalCopies: 5,
      shelfLocation: 'Rack A1',
      description: '',
      coverImage: '',
      isEContent: false,
      eBookType: 'text',
      eBookUrl: '',
      eBookContent: '',
    });
    setBookFile(null);
  };

  const openEditBook = (book) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title,
      author: book.author,
      bookCode: book.bookCode || '',
      isbn: book.isbn || '',
      category: book.category,
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || 2023,
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation || '',
      description: book.description || '',
      coverImage: book.coverImage || '',
      isEContent: Boolean(book.isEContent),
      eBookType: book.eBookType || 'none',
      eBookUrl: book.eBookUrl || '',
      eBookContent: book.eBookContent || '',
    });
    setShowAddBookModal(true);
  };

  // 4. Physical Direct Intake Handler
  const handleDirectIntakeSubmit = async (e) => {
    e.preventDefault();
    setDirectIntakeLoading(true);
    try {
      const res = await transactionService.directIssueBook(directIntakeData);
      if (res.success) {
        alert('Physical book intake logged successfully!');
        setDirectIntakeData({
          bookCode: '',
          userName: '',
          userEmail: '',
          userPhone: '',
          intakeTime: new Date().toISOString().slice(0, 16),
          returnDateTime: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 14);
            return d.toISOString().slice(0, 16);
          })(),
          notes: '',
        });
        fetchTransactions();
        fetchBooks();
        fetchStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to log physical intake');
    } finally {
      setDirectIntakeLoading(false);
    }
  };

  // 5. Review Borrow Application (Approve/Reject)
  const handleReviewApplication = async (id, action) => {
    const notes = prompt(`Optional remarks for ${action}:`, action === 'approve' ? 'Approved by Librarian' : 'Rejected');
    try {
      await transactionService.reviewApplication(id, { action, notes });
      fetchTransactions();
      fetchStats();
    } catch (err) {
      alert(err.message || `Failed to ${action} request`);
    }
  };

  // 6. Issue Approved Physical Book
  const handleIssueBook = async (id) => {
    try {
      await transactionService.issuePhysicalBook(id, {
        intakeTime: new Date().toISOString(),
      });
      alert('Physical book issued. Intake recorded!');
      fetchTransactions();
      fetchBooks();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to issue book');
    }
  };

  // 7. Return Book Handler
  const handleReturnBook = async (id) => {
    if (!window.confirm('Mark this physical book as returned?')) return;
    try {
      await transactionService.returnBook(id);
      alert('Book marked as returned! Inventory restored.');
      fetchTransactions();
      fetchBooks();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to return book');
    }
  };

  // 8. User Status Toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await userService.updateUserStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading fullScreen message="Loading Librarian Command Center..." />
      </DashboardLayout>
    );
  }

  const { stats: dashStats, booksByCategory, monthlyChartData, statusBreakdown } = stats || {};

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const q = bookSearch.toLowerCase();
    const matchQuery =
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.bookCode && b.bookCode.toLowerCase().includes(q));
    const matchCategory = !bookCategory || bookCategory === 'All' || b.category === bookCategory;
    return matchQuery && matchCategory;
  });

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    if (circulationFilter === 'all') return true;
    return t.status === circulationFilter;
  });

  const pendingRequests = transactions.filter((t) => t.status === 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        {/* Top Header & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-700 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                Head Librarian Control
              </span>
              <span className="text-xs text-gray-500">Fixed Login</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-1">
              Librarian Command Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              AI-driven circulation intelligence, catalog management, physical intake logging & member operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <Button
              size="sm"
              onClick={() => {
                resetBookForm();
                setEditingBook(null);
                setShowAddBookModal(true);
              }}
              className="shadow-md shadow-primary-500/20"
            >
              <Plus size={16} /> Add New Book
            </Button>
          </div>
        </div>

        {/* Command Navigation Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'analytics', label: 'AI Analytics & Charts', icon: BarChart3 },
            { id: 'books', label: `Books Management (${books.length})`, icon: BookOpen },
            { id: 'circulation', label: 'Physical Intake Logger & Loans', icon: Clock },
            {
              id: 'requests',
              label: `Borrow Requests (${pendingRequests.length})`,
              icon: AlertTriangle,
              badge: pendingRequests.length,
            },
            { id: 'users', label: `User Management (${allUsers.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-[11px] font-black flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 5 KEY KPI STAT CARDS (Explicitly required by user) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Total Books */}
          <motion.div whileHover={{ y: -3 }} className="card border border-primary-100 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Books</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-gray-900 dark:text-white">{dashStats?.totalBooks || 0}</span>
              <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{dashStats?.eContentBooksCount || 0} E-Books</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary-600 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </motion.div>

          {/* Total Users */}
          <motion.div whileHover={{ y: -3 }} className="card border border-primary-100 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-gray-900 dark:text-white">{dashStats?.totalUsers || 0}</span>
              <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">Registered</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary-600 h-full rounded-full" style={{ width: '85%' }} />
            </div>
          </motion.div>

          {/* Issued Books */}
          <motion.div whileHover={{ y: -3 }} className="card border border-primary-100 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issued Books</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{dashStats?.issuedBooks || 0}</span>
              <span className="text-xs text-primary-600 font-semibold">Active Loans</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary-500 h-full rounded-full" style={{ width: `${Math.min(100, ((dashStats?.issuedBooks || 0) / (dashStats?.totalBooks || 1)) * 100)}%` }} />
            </div>
          </motion.div>

          {/* Returned Books */}
          <motion.div whileHover={{ y: -3 }} className="card border border-primary-100 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Returned Books</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{dashStats?.returnedBooks || 0}</span>
              <span className="text-xs text-primary-600 font-semibold">Completed</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary-500 h-full rounded-full" style={{ width: '90%' }} />
            </div>
          </motion.div>

          {/* Available Books */}
          <motion.div whileHover={{ y: -3 }} className="card border border-primary-100 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Available Books</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{dashStats?.availableBooks || 0}</span>
              <span className="text-xs text-primary-600 font-semibold">On Shelf</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary-500 h-full rounded-full" style={{ width: '75%' }} />
            </div>
          </motion.div>
        </div>

        {/* TAB 1: AI ANALYTICS & INTERACTIVE CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* AI Analytical Dashboard Intelligence Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary-900 via-[#302653] to-[#1f1938] text-white shadow-2xl border border-primary-700/40 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <Brain size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                      AI Analytical Dashboard
                      <span className="px-2 py-0.5 rounded-md bg-primary-500/30 text-primary-200 text-xs font-mono">
                        Groq LLaMA 3.3
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Real-time circulation analysis, demand forecasting & risk intelligence
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleGenerateAiAnalytics}
                  loading={aiLoading}
                  className="bg-primary-500 hover:bg-primary-600 text-white border-none shadow-lg shadow-primary-500/30"
                >
                  <Sparkles size={16} />
                  {aiAnalytics ? 'Regenerate AI Report' : 'Generate AI Intelligence'}
                </Button>
              </div>

              {/* AI Report Cards */}
              {aiAnalytics ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6"
                >
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-300 flex items-center gap-1.5">
                      <TrendingUp size={14} /> Executive Summary
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {aiAnalytics.executiveSummary}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Layers size={14} /> Circulation Health & Risk
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {aiAnalytics.circulationHealth}
                    </p>
                    <p className="text-xs text-amber-300/90 pt-1">
                      ⚠️ <strong>Risk Radar:</strong> {aiAnalytics.overdueRiskAssessment}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Sparkles size={14} /> Recommended Acquisitions
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {aiAnalytics.recommendedAcquisitions?.map((rec, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[11px] font-bold text-slate-300 block mb-1">Top Action Item:</span>
                      <p className="text-xs text-slate-300 italic">
                        {aiAnalytics.actionableInsights?.[0] || 'Optimize physical shelf layouts.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <Bot size={40} className="mx-auto text-purple-400 opacity-60" />
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Click <strong>"Generate AI Intelligence"</strong> to analyze all {dashStats?.totalBooks || 0} books, {dashStats?.totalUsers || 0} users, and circulation transactions with Groq LLaMA 3.3.
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Charts & Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Interactive Monthly Circulation Chart */}
              <div className="lg:col-span-8 card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <BarChart3 size={20} className="text-primary-600 dark:text-primary-400" />
                      Monthly Circulation Trends (Issued vs Returned)
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Visual comparison of physical loans issued and completed returns
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <span className="w-3 h-3 rounded-sm bg-blue-500" /> Issued
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Returned
                    </span>
                  </div>
                </div>

                {/* SVG/HTML Bar Chart Visualization */}
                <div className="h-64 flex items-end justify-between gap-3 pt-8 px-4 border-b border-gray-100 dark:border-slate-700">
                  {monthlyChartData?.map((item, idx) => {
                    const maxVal = Math.max(1, ...monthlyChartData.map((d) => Math.max(d.issued, d.returned)));
                    const issuedHeight = Math.max(8, (item.issued / maxVal) * 180);
                    const returnedHeight = Math.max(8, (item.returned / maxVal) * 180);

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-20">
                          Issued: {item.issued} | Returned: {item.returned}
                        </div>

                        {/* Bars */}
                        <div className="w-full flex items-end justify-center gap-1.5 h-[190px]">
                          <div
                            style={{ height: `${issuedHeight}px` }}
                            className="w-1/2 max-w-[24px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-500 hover:brightness-110"
                          />
                          <div
                            style={{ height: `${returnedHeight}px` }}
                            className="w-1/2 max-w-[24px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 hover:brightness-110"
                          />
                        </div>

                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Breakdown & Category Distribution */}
              <div className="lg:col-span-4 space-y-6">
                {/* Category Breakdown Meter */}
                <div className="card">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Layers size={18} className="text-primary-500" />
                    Books by Category
                  </h3>
                  <div className="space-y-3">
                    {booksByCategory?.slice(0, 5).map((cat, idx) => {
                      const maxCat = Math.max(...booksByCategory.map((c) => c.count));
                      const percent = Math.round((cat.count / (dashStats?.totalBooks || 1)) * 100);

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-700 dark:text-gray-300">{cat._id}</span>
                            <span className="text-gray-500">{cat.count} books ({percent}%)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full"
                              style={{ width: `${(cat.count / maxCat) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Breakdown Donut/Pills */}
                <div className="card">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                    Circulation Status Distribution
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {statusBreakdown?.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-700/30">
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block">
                          {item.status}
                        </span>
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Librarian AI Copilot Assistant Box */}
            <div className="card border border-primary-100 dark:border-slate-700">
              <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-slate-700">
                <Bot size={20} className="text-primary-600 dark:text-primary-400" />
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Librarian AI Copilot (Ask Anything)
                </h3>
                <span className="text-xs text-gray-500 ml-auto">Interactive query tool</span>
              </div>

              {/* Chat log */}
              <div className="mb-4 h-56 space-y-3 overflow-y-auto rounded-2xl bg-primary-50/60 p-4 text-xs dark:bg-slate-900/50 sm:text-sm">
                {copilotMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`w-fit max-w-[88%] break-words rounded-2xl p-3.5 leading-6 ${
                      m.role === 'user'
                        ? 'ml-auto bg-primary-700 text-white'
                        : 'border border-primary-100 bg-white text-gray-800 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200'
                    }`}
                  >
                    {m.content.split('\n').map((l, j) => (
                      <p key={j} className={j > 0 ? 'mt-1' : ''}>{l}</p>
                    ))}
                  </div>
                ))}
                {copilotLoading && (
                  <div className="text-xs text-gray-500 italic flex items-center gap-1.5 p-2">
                    <Sparkles size={14} className="animate-spin text-primary-500" />
                    Athena Copilot is analyzing library data...
                  </div>
                )}
              </div>

              {/* Query form */}
              <form onSubmit={handleSendCopilot} className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  placeholder="e.g., Which categories have highest demand? Or how to reduce overdue loans?"
                  className="h-12 flex-1 text-xs sm:text-sm rounded-xl"
                  disabled={copilotLoading}
                />
                <Button size="sm" type="submit" loading={copilotLoading} className="shrink-0">
                  <Send size={16} /> Ask Copilot
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKS & E-CONTENT MANAGEMENT */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Book Inventory & E-Content Management
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add new books, generate Book Codes, upload e-content files, share links, or adjust copy counts
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search title, author, or Book Code..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs sm:w-64 sm:text-sm rounded-xl"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    className="w-full py-2 px-3 text-xs sm:w-36 sm:text-sm rounded-xl"
                  >
                    <option value="">All Categories</option>
                    {[...new Set(books.map((b) => b.category))].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Books Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">Cover & Title</th>
                      <th className="py-3 px-3">Book Code</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Copies (Avail / Total)</th>
                      <th className="py-3 px-3">Format</th>
                      <th className="py-3 px-3">Shelf</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                    {filteredBooks.map((book) => (
                      <tr key={book._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{book.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-primary-600 dark:text-primary-400">
                          {book.bookCode}
                        </td>
                        <td className="py-3 px-3">{book.category}</td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${book.availableCopies === 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {book.availableCopies}
                          </span>
                          <span className="text-gray-400"> / {book.totalCopies}</span>
                        </td>
                        <td className="py-3 px-3">
                          {book.isEContent ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                              E-Content ({book.eBookType || 'digital'})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-[11px]">
                              Physical Only
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-500 font-mono text-xs">{book.shelfLocation || 'Main'}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {book.isEContent && (
                              <button
                                onClick={() => setPreviewBook(book)}
                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 text-primary-600 dark:text-primary-400"
                                title="Read Live"
                              >
                                <Eye size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => openEditBook(book)}
                              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400"
                              title="Edit Book Details"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                              title="Delete Book"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHYSICAL INTAKE LOGGER & ACTIVE LOANS */}
        {activeTab === 'circulation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Direct Physical Intake Form */}
            <div className="lg:col-span-5 card border border-indigo-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-slate-700">
                <Clock size={20} className="text-primary-600" />
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Direct Physical Intake Logger
                  </h3>
                  <p className="text-xs text-gray-500">Record book checkout for physical walk-in users</p>
                </div>
              </div>

              <form onSubmit={handleDirectIntakeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Book Code or Select Title *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. BK-1001"
                      value={directIntakeData.bookCode}
                      onChange={(e) => setDirectIntakeData((prev) => ({ ...prev, bookCode: e.target.value.toUpperCase() }))}
                      required
                      className="text-xs sm:text-sm font-mono font-bold uppercase rounded-xl flex-1"
                    />
                    <select
                      onChange={(e) => setDirectIntakeData((prev) => ({ ...prev, bookCode: e.target.value }))}
                      className="text-xs rounded-xl w-36"
                    >
                      <option value="">Pick from list</option>
                      {books.map((b) => (
                        <option key={b._id} value={b.bookCode}>
                          {b.bookCode} - {b.title.slice(0, 15)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Member Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={directIntakeData.userName}
                      onChange={(e) => setDirectIntakeData((prev) => ({ ...prev, userName: e.target.value }))}
                      required
                      className="text-xs sm:text-sm rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Member Email
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={directIntakeData.userEmail}
                      onChange={(e) => setDirectIntakeData((prev) => ({ ...prev, userEmail: e.target.value }))}
                      className="text-xs sm:text-sm rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Member Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={directIntakeData.userPhone}
                    onChange={(e) => setDirectIntakeData((prev) => ({ ...prev, userPhone: e.target.value }))}
                    className="text-xs sm:text-sm rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Intake Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={directIntakeData.intakeTime}
                      onChange={(e) => setDirectIntakeData((prev) => ({ ...prev, intakeTime: e.target.value }))}
                      required
                      className="text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Scheduled Return Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={directIntakeData.returnDateTime}
                      onChange={(e) => setDirectIntakeData((prev) => ({ ...prev, returnDateTime: e.target.value }))}
                      required
                      className="text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Librarian Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Physical desk handover, ID verified"
                    value={directIntakeData.notes}
                    onChange={(e) => setDirectIntakeData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="text-xs sm:text-sm rounded-xl"
                  />
                </div>

                <Button fullWidth type="submit" loading={directIntakeLoading} className="py-2.5">
                  <Clock size={16} /> Log Physical Intake & Issue
                </Button>
              </form>
            </div>

            {/* Active & Past Loans Table */}
            <div className="lg:col-span-7 card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Physical Circulation Log
                  </h3>
                  <p className="text-xs text-gray-500">Track all issued, returned, and overdue books</p>
                </div>

                <div className="flex gap-1.5">
                  {['all', 'issued', 'returned', 'overdue'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setCirculationFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${
                        circulationFilter === filter
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-400 uppercase text-[10px]">
                      <th className="py-2.5 px-2">Book Code & Name</th>
                      <th className="py-2.5 px-2">Borrower</th>
                      <th className="py-2.5 px-2">Intake Time</th>
                      <th className="py-2.5 px-2">Due / Return Date</th>
                      <th className="py-2.5 px-2">Status</th>
                      <th className="py-2.5 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                    {filteredTransactions.map((t) => {
                      const borrowerName = t.applicantInfo?.name || t.user?.name || 'Walk-in Member';
                      const isOverdue = t.status === 'issued' && t.dueDate && new Date(t.dueDate) < new Date();

                      return (
                        <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40">
                          <td className="py-2.5 px-2 font-medium">
                            <span className="font-mono text-primary-600 dark:text-primary-400 block font-bold">
                              {t.bookCode || t.book?.bookCode}
                            </span>
                            <span className="truncate max-w-[140px] block text-gray-800 dark:text-gray-200">
                              {t.bookTitle || t.book?.title}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="font-semibold block">{borrowerName}</span>
                            <span className="text-[10px] text-gray-400">{t.applicantInfo?.phone || t.user?.phone || 'No phone'}</span>
                          </td>
                          <td className="py-2.5 px-2 text-gray-500">
                            {t.issueDate ? new Date(t.issueDate).toLocaleDateString() : 'Pending'}
                          </td>
                          <td className="py-2.5 px-2 text-gray-500">
                            {t.returnDate
                              ? `Returned: ${new Date(t.returnDate).toLocaleDateString()}`
                              : t.dueDate
                              ? new Date(t.dueDate).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="py-2.5 px-2">
                            {t.status === 'returned' ? (
                              <span className="badge badge-success">Returned</span>
                            ) : isOverdue ? (
                              <span className="badge badge-danger">Overdue</span>
                            ) : t.status === 'issued' ? (
                              <span className="badge badge-primary">Issued</span>
                            ) : (
                              <span className="badge badge-warning">{t.status}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            {t.status === 'issued' && (
                              <button
                                onClick={() => handleReturnBook(t._id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                              >
                                Mark Returned
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BORROW APPLICATIONS QUEUE */}
        {activeTab === 'requests' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  User Borrow Applications Queue
                </h3>
                <p className="text-xs text-gray-500">
                  Review member reservations submitted with Book Code & Requested From/To dates
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
                {pendingRequests.length} Pending Actions
              </span>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-400 uppercase text-[11px]">
                      <th className="py-3 px-3">Applicant Name</th>
                      <th className="py-3 px-3">Book Code & Title</th>
                      <th className="py-3 px-3">Requested From Date</th>
                      <th className="py-3 px-3">Requested To Date</th>
                      <th className="py-3 px-3">Applicant Notes</th>
                      <th className="py-3 px-3 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                    {pendingRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40">
                        <td className="py-3 px-3">
                          <p className="font-bold">{req.applicantInfo?.name || req.user?.name}</p>
                          <p className="text-xs text-gray-500">{req.applicantInfo?.email || req.user?.email}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-primary-600 block">{req.bookCode}</span>
                          <span className="text-xs text-gray-800 dark:text-gray-200">{req.bookTitle || req.book?.title}</span>
                        </td>
                        <td className="py-3 px-3">
                          {req.requestFromDate ? new Date(req.requestFromDate).toLocaleDateString() : 'ASAP'}
                        </td>
                        <td className="py-3 px-3">
                          {req.requestToDate ? new Date(req.requestToDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-xs italic text-gray-500">
                          {req.librarianNotes || 'None'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReviewApplication(req._id, 'approve')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleIssueBook(req._id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow"
                              title="Approve and Hand Over Now"
                            >
                              <Clock size={14} /> Issue Now
                            </button>
                            <button
                              onClick={() => handleReviewApplication(req._id, 'reject')}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
                <p className="font-bold">No pending borrow requests</p>
                <p className="text-xs">All user applications have been processed.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Member Directory & Account Control
                </h3>
                <p className="text-xs text-gray-500">View registered library members and manage account access</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-400 uppercase text-[11px]">
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {allUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40">
                      <td className="py-3 px-3 font-bold">{u.name}</td>
                      <td className="py-3 px-3 font-mono">{u.email}</td>
                      <td className="py-3 px-3">{u.phone}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                              u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT BOOK MODAL */}
      <Modal
        isOpen={showAddBookModal}
        onClose={() => setShowAddBookModal(false)}
        title={editingBook ? 'Edit Book Details' : 'Add New Book to Catalog'}
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Book Name / Title *</label>
              <input
                type="text"
                required
                value={bookFormData.title}
                onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                placeholder="The Great Gatsby"
                className="text-sm rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Author Name *</label>
              <input
                type="text"
                required
                value={bookFormData.author}
                onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                placeholder="F. Scott Fitzgerald"
                className="text-sm rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Book Code (Leave blank to auto-generate)
              </label>
              <input
                type="text"
                value={bookFormData.bookCode}
                onChange={(e) => setBookFormData({ ...bookFormData, bookCode: e.target.value.toUpperCase() })}
                placeholder="e.g. BK-1009"
                className="text-sm font-mono font-bold uppercase rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category *</label>
              <input
                type="text"
                required
                value={bookFormData.category}
                onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                placeholder="Fiction, Science, etc."
                className="text-sm rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Total Copies *</label>
              <input
                type="number"
                min="1"
                required
                value={bookFormData.totalCopies}
                onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: parseInt(e.target.value) || 1 })}
                className="text-sm rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Shelf Location</label>
              <input
                type="text"
                value={bookFormData.shelfLocation}
                onChange={(e) => setBookFormData({ ...bookFormData, shelfLocation: e.target.value })}
                placeholder="Rack A1 - Tier 2"
                className="text-sm rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Publisher</label>
              <input
                type="text"
                value={bookFormData.publisher}
                onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                placeholder="Scribner"
                className="text-sm rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Publication Year</label>
              <input
                type="number"
                value={bookFormData.publicationYear}
                onChange={(e) => setBookFormData({ ...bookFormData, publicationYear: parseInt(e.target.value) || 2023 })}
                className="text-sm rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Cover Image URL</label>
            <input
              type="url"
              value={bookFormData.coverImage}
              onChange={(e) => setBookFormData({ ...bookFormData, coverImage: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="text-sm rounded-lg"
            />
          </div>

          {/* E-Content Settings */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookFormData.isEContent}
                  onChange={(e) => setBookFormData({ ...bookFormData, isEContent: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600"
                />
                Provide Digital E-Content (Live Reader / Download)
              </label>
            </div>

            {bookFormData.isEContent && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">E-Book File Upload (PDF/EPUB)</label>
                  <input
                    type="file"
                    accept=".pdf,.epub,.txt"
                    onChange={(e) => setBookFile(e.target.files[0])}
                    className="text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Or External Digital Resource Link</label>
                  <input
                    type="url"
                    value={bookFormData.eBookUrl}
                    onChange={(e) => setBookFormData({ ...bookFormData, eBookUrl: e.target.value })}
                    placeholder="https://openlibrary.org/works/..."
                    className="text-sm rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Live In-App Reading Content (Text/Markdown)</label>
                  <textarea
                    rows={4}
                    value={bookFormData.eBookContent}
                    onChange={(e) => setBookFormData({ ...bookFormData, eBookContent: e.target.value })}
                    placeholder="# Chapter 1..."
                    className="text-xs font-mono rounded-lg w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setShowAddBookModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={bookActionLoading}>
              Save Book
            </Button>
          </div>
        </form>
      </Modal>

      {/* IN-APP READER PREVIEW MODAL */}
      <InAppReaderModal
        isOpen={Boolean(previewBook)}
        onClose={() => setPreviewBook(null)}
        book={previewBook}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
