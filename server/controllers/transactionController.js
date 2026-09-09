import Transaction from '../models/Transaction.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// User submits borrow request with Book Code and From/To dates
export const applyForBook = asyncHandler(async (req, res) => {
  const { bookCode, bookId, fromDate, toDate, notes } = req.body;
  const userId = req.user.id;

  // Find book by ID or Book Code
  let book = null;
  if (bookId) {
    book = await Book.findById(bookId);
  } else if (bookCode) {
    book = await Book.findOne({ bookCode: bookCode.trim().toUpperCase() });
  }

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found with the specified details or Book Code',
    });
  }

  if (book.availableCopies <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Sorry, this book has no physical copies currently available in the library',
    });
  }

  // Validate dates
  if (!fromDate || !toDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both From Date and To Date for physical borrowing',
    });
  }

  const reqFrom = new Date(fromDate);
  const reqTo = new Date(toDate);

  if (isNaN(reqFrom.getTime()) || isNaN(reqTo.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid borrow dates provided',
    });
  }

  if (reqTo < reqFrom) {
    return res.status(400).json({
      success: false,
      message: 'Return Date (To Date) cannot be earlier than Intake Date (From Date)',
    });
  }

  // Check if user already has an active or pending request for this specific book
  const activeExisting = await Transaction.findOne({
    user: userId,
    book: book._id,
    status: { $in: ['pending', 'approved', 'issued'] },
  });

  if (activeExisting) {
    return res.status(400).json({
      success: false,
      message: `You already have an ongoing ${activeExisting.status} request/issue for this book`,
    });
  }

  // Fetch user info for applicantInfo snapshot
  const user = await User.findById(userId);

  const transaction = await Transaction.create({
    user: userId,
    book: book._id,
    bookCode: book.bookCode,
    bookTitle: book.title,
    borrowType: 'application',
    status: 'pending',
    requestFromDate: reqFrom,
    requestToDate: reqTo,
    dueDate: reqTo,
    applicantInfo: {
      name: user?.name || 'Member',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    librarianNotes: notes || '',
  });

  await transaction.populate('book user');

  res.status(201).json({
    success: true,
    message: 'Borrow application submitted successfully. The librarian will review your request.',
    transaction,
  });
});

// Librarian reviews (approves or rejects) user borrow application
export const reviewApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, revisedFromDate, revisedToDate, notes } = req.body;

  const transaction = await Transaction.findById(id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Application not found',
    });
  }

  if (transaction.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Application is already ${transaction.status}`,
    });
  }

  if (action === 'approve') {
    transaction.status = 'approved';
    if (revisedFromDate) transaction.requestFromDate = new Date(revisedFromDate);
    if (revisedToDate) {
      transaction.requestToDate = new Date(revisedToDate);
      transaction.dueDate = new Date(revisedToDate);
    }
  } else if (action === 'reject') {
    transaction.status = 'rejected';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Please specify "approve" or "reject"',
    });
  }

  if (notes) {
    transaction.librarianNotes = notes;
  }
  transaction.updatedAt = Date.now();

  await transaction.save();
  await transaction.populate('book user');

  res.status(200).json({
    success: true,
    message: `Borrow application has been ${transaction.status}`,
    transaction,
  });
});

// Librarian issues the approved book (records physical intake time & decreases inventory)
export const issuePhysicalBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { intakeTime, returnDateTime, notes } = req.body;

  const transaction = await Transaction.findById(id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
  }

  if (transaction.status === 'issued') {
    return res.status(400).json({
      success: false,
      message: 'Book has already been issued',
    });
  }

  const book = await Book.findById(transaction.book);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  if (book.availableCopies <= 0) {
    return res.status(400).json({
      success: false,
      message: 'No available copies left for this book',
    });
  }

  // Set issue timestamp (intake time) and due date
  transaction.status = 'issued';
  transaction.issueDate = intakeTime ? new Date(intakeTime) : new Date();
  if (returnDateTime) {
    transaction.dueDate = new Date(returnDateTime);
  } else if (!transaction.dueDate) {
    const defaultDue = new Date(transaction.issueDate);
    defaultDue.setDate(defaultDue.getDate() + 14);
    transaction.dueDate = defaultDue;
  }

  if (notes) {
    transaction.librarianNotes = notes;
  }

  transaction.updatedAt = Date.now();
  await transaction.save();

  // Decrement available copies
  book.availableCopies = Math.max(0, book.availableCopies - 1);
  await book.save();

  await transaction.populate('book user');

  res.status(200).json({
    success: true,
    message: 'Book physically issued. Intake time and return schedule recorded.',
    transaction,
  });
});

// Librarian logs physical intake directly for walk-in or phone user
export const directIssueBook = asyncHandler(async (req, res) => {
  const {
    bookCode,
    bookId,
    userName,
    userEmail,
    userPhone,
    intakeTime,
    returnDateTime,
    notes,
  } = req.body;

  if (!userName || (!bookCode && !bookId)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide user name and book code or book ID',
    });
  }

  let book = null;
  if (bookId) {
    book = await Book.findById(bookId);
  } else if (bookCode) {
    book = await Book.findOne({ bookCode: bookCode.trim().toUpperCase() });
  }

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found with specified code or ID',
    });
  }

  if (book.availableCopies <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Book has no physical copies available for issue',
    });
  }

  // Check if this email corresponds to a registered user
  let matchedUser = null;
  if (userEmail) {
    matchedUser = await User.findOne({ email: userEmail.trim().toLowerCase() });
  }

  const issueDate = intakeTime ? new Date(intakeTime) : new Date();
  let dueDate;
  if (returnDateTime) {
    dueDate = new Date(returnDateTime);
  } else {
    dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14);
  }

  const transaction = await Transaction.create({
    user: matchedUser ? matchedUser._id : undefined,
    book: book._id,
    bookCode: book.bookCode,
    bookTitle: book.title,
    borrowType: 'direct_librarian',
    status: 'issued',
    issueDate,
    dueDate,
    applicantInfo: {
      name: userName.trim(),
      email: userEmail ? userEmail.trim() : '',
      phone: userPhone ? userPhone.trim() : '',
    },
    librarianNotes: notes ? notes.trim() : '',
  });

  // Decrease available copies
  book.availableCopies = Math.max(0, book.availableCopies - 1);
  await book.save();

  await transaction.populate('book user');

  res.status(201).json({
    success: true,
    message: 'Physical book issued directly. Intake time and return schedule logged.',
    transaction,
  });
});

// Return physical book
export const returnBook = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
  }

  if (transaction.status === 'returned') {
    return res.status(400).json({
      success: false,
      message: 'Book has already been returned',
    });
  }

  // Update transaction status and actual return date
  transaction.returnDate = new Date();
  transaction.status = 'returned';
  transaction.updatedAt = Date.now();
  await transaction.save();

  // Increment available copies
  const book = await Book.findById(transaction.book);
  if (book) {
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    await book.save();
  }

  await transaction.populate('book user');

  res.status(200).json({
    success: true,
    message: 'Book returned successfully. Inventory updated.',
    transaction,
  });
});

// Get transactions (for Librarian with complete filters)
export const getTransactions = asyncHandler(async (req, res) => {
  const {
    status,
    borrowType,
    search,
    sortBy = '-createdAt',
    page = 1,
    limit = 20,
  } = req.query;

  let filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (borrowType) {
    filter.borrowType = borrowType;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { bookCode: searchRegex },
      { bookTitle: searchRegex },
      { 'applicantInfo.name': searchRegex },
      { 'applicantInfo.email': searchRegex },
      { 'applicantInfo.phone': searchRegex },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const transactions = await Transaction.find(filter)
    .populate('user', 'name email phone')
    .populate('book', 'title author isbn coverImage shelfLocation bookCode')
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Transaction.countDocuments(filter);

  // Auto-flag overdue transactions in response
  const now = new Date();
  transactions.forEach((trans) => {
    if (trans.status === 'issued' && trans.dueDate && now > trans.dueDate) {
      trans.status = 'overdue';
    }
  });

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    pages: Math.ceil(total / parseInt(limit)) || 1,
    currentPage: parseInt(page),
    transactions,
  });
});

// Get user's own transactions and applications
export const getUserTransactions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 50 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const transactions = await Transaction.find({ user: userId })
    .populate('book', 'title author isbn coverImage shelfLocation bookCode eBookUrl isEContent')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Transaction.countDocuments({ user: userId });

  const now = new Date();
  transactions.forEach((trans) => {
    if (trans.status === 'issued' && trans.dueDate && now > trans.dueDate) {
      trans.status = 'overdue';
    }
  });

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    pages: Math.ceil(total / parseInt(limit)) || 1,
    transactions,
  });
});

export default {
  applyForBook,
  reviewApplication,
  issuePhysicalBook,
  directIssueBook,
  returnBook,
  getTransactions,
  getUserTransactions,
};
