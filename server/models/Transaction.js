import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Please provide a book'],
  },
  bookCode: {
    type: String,
    trim: true,
    uppercase: true,
  },
  bookTitle: {
    type: String,
    trim: true,
  },
  borrowType: {
    type: String,
    enum: ['application', 'direct_librarian'],
    default: 'application',
  },
  requestFromDate: {
    type: Date,
  },
  requestToDate: {
    type: Date,
  },
  issueDate: {
    type: Date,
    default: null,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'issued', 'returned', 'rejected', 'overdue'],
    default: 'pending',
  },
  applicantInfo: {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  librarianNotes: {
    type: String,
    default: '',
    trim: true,
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
TransactionSchema.index({ user: 1 });
TransactionSchema.index({ book: 1 });
TransactionSchema.index({ bookCode: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ borrowType: 1 });

export default mongoose.model('Transaction', TransactionSchema);
