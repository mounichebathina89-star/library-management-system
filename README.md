# 📚 LibraryHub - Web-Based Library Management System

A complete, production-ready MERN stack application for managing library operations including books, users, transactions, and overdue tracking.

## 📋 Project Overview

LibraryHub is a modern, responsive web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides a comprehensive solution for library operations with role-based access, efficient book management, and transaction tracking.

### Key Features

- ✅ **User Authentication**: Secure registration and login with JWT
- ✅ **Book Management**: Add, edit, delete, and search books
- ✅ **Book Issuing**: Issue books with automatic due date calculation
- ✅ **Book Returns**: Track book returns and update inventory
- ✅ **Overdue Tracking**: Automatic detection and monitoring of overdue books
- ✅ **User Dashboard**: View issued books, borrowing history, and due dates
- ✅ **Admin Dashboard**: Statistics, analytics, and management tools
- ✅ **Search & Filter**: Powerful search with filters by category, author, ISBN
- ✅ **Dark/Light Mode**: Theme toggle with localStorage persistence
- ✅ **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ✅ **Role-Based Access**: Admin and user roles with different permissions

## 🛠️ Technology Stack

### Frontend
- **React.js 18+** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Router DOM** - Routing
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP logging
- **Express Rate Limit** - Rate limiting

## 📁 Project Structure

```
library-management-system/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── bookController.js
│   │   ├── transactionController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── asyncHandler.js
│   ├── seed/
│   │   └── seedAdmin.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── BookCard.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useTheme.js
│   │   │   └── useDebounce.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── bookService.js
│   │   │   ├── transactionService.js
│   │   │   └── userService.js
│   │   ├── layouts/
│   │   │   ├── PublicLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: 'admin' | 'user',
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Model
```javascript
{
  title: String,
  isbn: String (unique),
  author: String,
  category: String,
  publisher: String,
  publicationYear: Number,
  description: String,
  coverImage: String (URL),
  totalCopies: Number,
  availableCopies: Number,
  shelfLocation: String,
  language: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  user: ObjectId (ref: User),
  book: ObjectId (ref: Book),
  issueDate: Date,
  dueDate: Date,
  returnDate: Date (nullable),
  status: 'issued' | 'returned' | 'overdue',
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user` - Get all users (admin only)
- `PUT /api/user/:userId/status` - Update user status (admin only)

### Books
- `GET /api/books` - Get all books with pagination
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)
- `GET /api/books/search` - Search books

### Transactions
- `POST /api/transactions/issue` - Issue a book
- `PUT /api/transactions/:id/return` - Return a book (admin only)
- `GET /api/transactions` - Get all transactions (admin only)
- `GET /api/transactions/my` - Get user's transactions
- `GET /api/transactions/overdue` - Get overdue books (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (admin only)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB

### Installation

#### 1. Clone or Extract the Project
```bash
cd library-management-system
```

#### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and other config
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management
# JWT_SECRET=your_secure_secret_key
# PORT=5000
# CLIENT_URL=http://localhost:5173

# Seed database with admin and sample data
npm run seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if backend is on different port/host
# VITE_API_BASE_URL=http://localhost:5000/api

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Default Admin Credentials

After running `npm run seed` in the server directory:

**Email:** `admin@library.com`  
**Password:** `Admin@123`

## 👥 User Roles

### Admin
- View dashboard with statistics
- Manage books (add, edit, delete)
- Manage users (view, activate/deactivate)
- Process book transactions
- View all transactions
- Track overdue books

### User
- Browse books
- Search and filter books
- Issue books
- View issued books
- View transaction history
- Manage profile

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT authentication
- ✅ HTTP security headers (Helmet)
- ✅ CORS configuration
- ✅ Rate limiting on auth endpoints
- ✅ Input validation
- ✅ Protected routes with role-based authorization
- ✅ MongoDB injection protection via Mongoose
- ✅ Secure token expiration

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- Mobile (320px and up)
- Tablet (768px and up)
- Desktop (1024px and up)

## 🌙 Dark Mode

Toggle between light and dark themes with persistent storage in localStorage.

## 🎨 UI Components

### Reusable Components
- **Button** - Customizable button with variants
- **Loading** - Loading spinner with message
- **Modal** - Dialog modal with animations
- **SearchBar** - Search input with debouncing
- **BookCard** - Book display card
- **EmptyState** - Empty state with icon
- **ProtectedRoute** - Route protection wrapper
- **Navbar** - Top navigation bar
- **Footer** - Footer component
- **Sidebar** - Admin sidebar navigation

## 🏗️ Build & Deployment

### Frontend Build
```bash
cd client
npm run build
```

Output: `dist/` directory

### Deploy Frontend to:
- **Vercel** - `vercel deploy`
- **Netlify** - Drag and drop `dist/` folder
- **GitHub Pages** - Configure in vite.config.js

### Deploy Backend to:
- **Render** - Connect GitHub repository
- **Railway** - `railway up`
- **Heroku** - `git push heroku main`
- **AWS EC2** - Deploy with PM2

### Environment Variables for Production

**Backend (.env)**
```
PORT=production_port
MONGO_URI=mongodb+srv://prod_user:prod_pass@prod_cluster.mongodb.net/library-prod
JWT_SECRET=very_secure_production_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

**Frontend (.env.production)**
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 📖 Usage Examples

### Register a New User
1. Go to `/register`
2. Fill in name, email, phone, password
3. Click "Create Account"
4. Automatically logged in and redirected to dashboard

### Issue a Book
1. Go to `/books` or `/dashboard`
2. Find a book with available copies
3. Click "Issue Book"
4. Confirm the action
5. Book is added to "Issued Books" with 14-day due date

### Return a Book
1. Go to `/dashboard`
2. Find the issued book
3. Click "Return" (admin only action)
4. Book availability is updated
5. Transaction marked as "returned"

## 🔄 Data Flow

```
User Action
    ↓
React Component
    ↓
API Service (Axios)
    ↓
Backend Route
    ↓
Controller/Middleware
    ↓
Database (MongoDB)
    ↓
Response back to Component
    ↓
UI Update
```

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection: `mongo --version`
- Verify `.env` file exists and has correct `MONGO_URI`
- Check if port 5000 is already in use

### Frontend won't load
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear vite cache: `rm -rf .vite`
- Check if `VITE_API_BASE_URL` is correct

### Can't seed database
- Ensure MongoDB is running
- Check MongoDB URI in `.env`
- Verify network access in MongoDB Atlas

### API calls failing
- Check CORS configuration in `server.js`
- Verify frontend `VITE_API_BASE_URL` matches backend
- Check browser console for error messages

## 📚 Additional Features to Implement

- Email notifications for overdue books
- Book reviews and ratings
- Reading lists and wishlist
- Fine calculation for overdue books
- Payment integration for fines
- Advanced analytics and reports
- Book reservation system
- Author and publisher management
- ISBN barcode scanning
- Mobile app with React Native

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

Created as a comprehensive MERN stack library management system.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API endpoints documentation
3. Check browser console for error messages
4. Verify environment variables

---

**Happy Library Managing! 📚✨**
#   l i b r a r y - m a n a g e m e n t - s y s t e m  
 #   l i b r a r y - m a n a g e m e n t - s y s t e m  
 