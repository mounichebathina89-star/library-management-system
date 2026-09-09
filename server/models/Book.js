import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a book title'],
    trim: true,
  },
  isbn: {
    type: String,
    required: [true, 'Please provide an ISBN'],
    unique: true,
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'Please provide an author name'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
  },
  publisher: {
    type: String,
    required: [true, 'Please provide a publisher'],
    trim: true,
  },
  publicationYear: {
    type: Number,
    required: [true, 'Please provide a publication year'],
  },
  description: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
    default: 'https://via.placeholder.com/300x400?text=Book+Cover',
  },
  totalCopies: {
    type: Number,
    required: [true, 'Please provide total copies'],
    min: 1,
  },
  availableCopies: {
    type: Number,
    required: [true, 'Please provide available copies'],
    min: 0,
  },
  shelfLocation: {
    type: String,
    trim: true,
  },
  bookCode: {
    type: String,
    trim: true,
    uppercase: true,
  },
  isEContent: {
    type: Boolean,
    default: false,
  },
  eBookType: {
    type: String,
    enum: ['none', 'pdf', 'link', 'text'],
    default: 'none',
  },
  eBookUrl: {
    type: String,
    default: '',
    trim: true,
  },
  eBookContent: {
    type: String,
    default: '',
  },
  pdfOriginalName: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'English',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for frequently searched fields
BookSchema.index({ title: 'text', author: 'text', isbn: 'text', bookCode: 'text' });
BookSchema.index({ category: 1 });
BookSchema.index({ isbn: 1 });
BookSchema.index({ bookCode: 1 });
BookSchema.index({ isEContent: 1 });

export default mongoose.model('Book', BookSchema);
