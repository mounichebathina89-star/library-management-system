import Book from '../models/Book.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();

  // Basic counters
  const totalBooks = await Book.countDocuments();
  const totalUsers = await User.countDocuments({ role: 'user' });
  const eContentBooksCount = await Book.countDocuments({ isEContent: true });

  const issuedBooks = await Transaction.countDocuments({
    status: 'issued',
  });

  const returnedBooks = await Transaction.countDocuments({
    status: 'returned',
  });

  const pendingRequests = await Transaction.countDocuments({
    status: 'pending',
  });

  const approvedRequests = await Transaction.countDocuments({
    status: 'approved',
  });

  const overdueBooks = await Transaction.countDocuments({
    status: 'issued',
    dueDate: { $lt: now },
  });

  const totalTransactions = await Transaction.countDocuments();

  // Sum of available physical copies
  const availableBooksAggregate = await Book.aggregate([
    {
      $group: {
        _id: null,
        totalAvailable: { $sum: '$availableCopies' },
        totalPhysicalCopies: { $sum: '$totalCopies' },
      },
    },
  ]);

  const availableBooks = availableBooksAggregate[0]?.totalAvailable || 0;
  const totalPhysicalCopies = availableBooksAggregate[0]?.totalPhysicalCopies || 0;

  // Books by category
  const booksByCategory = await Book.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Status breakdown for donut/pie chart
  const statusBreakdown = [
    { status: 'Available', count: availableBooks, color: '#10b981' },
    { status: 'Issued', count: issuedBooks, color: '#3b82f6' },
    { status: 'Returned', count: returnedBooks, color: '#6366f1' },
    { status: 'Pending', count: pendingRequests, color: '#f59e0b' },
    { status: 'Overdue', count: overdueBooks, color: '#ef4444' },
  ];

  // Monthly circulation activity (last 6 months) for interactive line/bar chart
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyTransactions = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Format monthly circulation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyChartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mNum = d.getMonth() + 1;
    const yNum = d.getFullYear();
    const label = `${months[d.getMonth()]} ${yNum.toString().slice(2)}`;

    const issuedCount = monthlyTransactions
      .filter((t) => t._id.month === mNum && t._id.year === yNum && (t._id.status === 'issued' || t._id.status === 'returned'))
      .reduce((sum, item) => sum + item.count, 0);

    const returnedCount = monthlyTransactions
      .filter((t) => t._id.month === mNum && t._id.year === yNum && t._id.status === 'returned')
      .reduce((sum, item) => sum + item.count, 0);

    monthlyChartData.push({
      month: label,
      issued: issuedCount,
      returned: returnedCount,
    });
  }

  // Recent transactions
  const recentTransactions = await Transaction.find()
    .populate('user', 'name email phone')
    .populate('book', 'title author bookCode coverImage')
    .sort('-createdAt')
    .limit(10);

  // Recently added books
  const recentlyAddedBooks = await Book.find()
    .sort('-createdAt')
    .limit(6);

  res.status(200).json({
    success: true,
    stats: {
      totalBooks,
      totalUsers,
      issuedBooks,
      returnedBooks,
      availableBooks,
      totalPhysicalCopies,
      pendingRequests,
      approvedRequests,
      overdueBooks,
      totalTransactions,
      eContentBooksCount,
    },
    statusBreakdown,
    booksByCategory,
    monthlyChartData,
    recentTransactions,
    recentlyAddedBooks,
  });
});

export default { getDashboardStats };
