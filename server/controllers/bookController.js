import Book from '../models/Book.js';
import Transaction from '../models/Transaction.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper to generate a unique book code
const generateBookCode = async () => {
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    code = `BK-${randomNum}`;
    const existing = await Book.findOne({ bookCode: code });
    if (!existing) isUnique = true;
  }
  return code;
};

export const getAllBooks = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    author,
    bookCode,
    eContentOnly,
    sortBy = '-createdAt',
    page = 1,
    limit = 12,
  } = req.query;

  let filter = {};

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { title: searchRegex },
      { author: searchRegex },
      { isbn: searchRegex },
      { bookCode: searchRegex },
      { category: searchRegex },
    ];
  }

  if (bookCode) {
    filter.bookCode = new RegExp(bookCode.trim(), 'i');
  }

  if (category && category !== 'All' && category !== '') {
    filter.category = category;
  }

  if (author) {
    filter.author = new RegExp(author.trim(), 'i');
  }

  if (eContentOnly === 'true' || eContentOnly === true) {
    filter.isEContent = true;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const books = await Book.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Book.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: books.length,
    total,
    pages: Math.ceil(total / parseInt(limit)) || 1,
    currentPage: parseInt(page),
    books,
  });
});

export const getBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const book = await Book.findById(id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  res.status(200).json({
    success: true,
    book,
  });
});

export const getBookByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const book = await Book.findOne({ bookCode: code.trim().toUpperCase() });

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book with code ${code} not found`,
    });
  }

  res.status(200).json({
    success: true,
    book,
  });
});

export const addBook = asyncHandler(async (req, res) => {
  let {
    title,
    isbn,
    bookCode,
    author,
    category,
    publisher,
    publicationYear,
    description,
    coverImage,
    totalCopies,
    shelfLocation,
    language,
    isEContent,
    eBookType,
    eBookUrl,
    eBookContent,
  } = req.body;

  // Validation
  if (!title || !author || !category) {
    return res.status(400).json({
      success: false,
      message: 'Please provide book title, author, and category',
    });
  }

  // Fallbacks for optional/calculated fields
  publisher = publisher || 'Standard Edition';
  publicationYear = publicationYear ? parseInt(publicationYear) : new Date().getFullYear();
  totalCopies = totalCopies ? parseInt(totalCopies) : 1;
  shelfLocation = shelfLocation || 'General Rack';

  // Handle auto-generating ISBN if omitted
  if (!isbn) {
    isbn = `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  } else {
    // Check if ISBN already exists
    const existingIsbn = await Book.findOne({ isbn });
    if (existingIsbn) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists',
      });
    }
  }

  // Handle Book Code (user provided or auto-generated)
  if (bookCode) {
    bookCode = bookCode.trim().toUpperCase();
    const existingCode = await Book.findOne({ bookCode });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Book code ${bookCode} is already assigned to another book`,
      });
    }
  } else {
    bookCode = await generateBookCode();
  }

  // Handle file upload if present
  let pdfOriginalName = '';
  if (req.file) {
    eBookUrl = `/uploads/${req.file.filename}`;
    pdfOriginalName = req.file.originalname;
    isEContent = true;
    eBookType = 'pdf';
  } else if (eBookUrl && eBookUrl.trim().length > 0) {
    isEContent = true;
    if (!eBookType || eBookType === 'none') {
      eBookType = eBookUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link';
    }
  } else if (eBookContent && eBookContent.trim().length > 0) {
    isEContent = true;
    eBookType = 'text';
  }

  const book = await Book.create({
    title: title.trim(),
    isbn,
    bookCode,
    author: author.trim(),
    category: category.trim(),
    publisher: publisher.trim(),
    publicationYear,
    description: description ? description.trim() : '',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    totalCopies,
    availableCopies: totalCopies,
    shelfLocation: shelfLocation.trim(),
    language: language || 'English',
    isEContent: Boolean(isEContent),
    eBookType: eBookType || 'none',
    eBookUrl: eBookUrl || '',
    eBookContent: eBookContent || '',
    pdfOriginalName,
  });

  res.status(201).json({
    success: true,
    message: 'Book added successfully',
    book,
  });
});

export const updateBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.isbn) {
    delete updates.isbn; // Keep ISBN immutable
  }

  if (updates.bookCode) {
    updates.bookCode = updates.bookCode.trim().toUpperCase();
    const existing = await Book.findOne({ bookCode: updates.bookCode, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Book code is already in use by another book',
      });
    }
  }

  // File upload update
  if (req.file) {
    updates.eBookUrl = `/uploads/${req.file.filename}`;
    updates.pdfOriginalName = req.file.originalname;
    updates.isEContent = true;
    updates.eBookType = 'pdf';
  }

  if (updates.totalCopies !== undefined) {
    const currentBook = await Book.findById(id);
    if (currentBook) {
      const difference = parseInt(updates.totalCopies) - currentBook.totalCopies;
      updates.availableCopies = Math.max(0, currentBook.availableCopies + difference);
    }
  }

  updates.updatedAt = Date.now();

  const book = await Book.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Book updated successfully',
    book,
  });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const book = await Book.findByIdAndDelete(id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  // Clean up associated pending transactions
  await Transaction.deleteMany({ book: id, status: 'pending' });

  res.status(200).json({
    success: true,
    message: 'Book deleted successfully',
  });
});

export const searchBooks = asyncHandler(async (req, res) => {
  const { q, category, eContentOnly, sortBy = '-createdAt', page = 1, limit = 12 } = req.query;

  let filter = {};

  if (q) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { title: regex },
      { author: regex },
      { isbn: regex },
      { bookCode: regex },
      { category: regex },
    ];
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (eContentOnly === 'true' || eContentOnly === true) {
    filter.isEContent = true;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const books = await Book.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Book.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: books.length,
    total,
    pages: Math.ceil(total / parseInt(limit)) || 1,
    books,
  });
});

export default {
  getAllBooks,
  getBookById,
  getBookByCode,
  addBook,
  updateBook,
  deleteBook,
  searchBooks,
};
