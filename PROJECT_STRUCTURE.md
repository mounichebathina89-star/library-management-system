# 📂 Project Structure & File Guide

Complete overview of all files and their purposes in the LibraryHub MERN Stack application.

## 📁 Root Directory
```
library-management-system/
├── README.md              - Main project documentation
├── SETUP_GUIDE.md         - Detailed setup instructions
├── QUICKSTART.md          - Quick start guide
├── server/                - Backend application
└── client/                - Frontend application
```

## 🔙 Backend (server/)

### Core Files
- **server.js** - Main server entry point, Express configuration, route mounting
- **package.json** - Backend dependencies and scripts
- **.env.example** - Environment variables template

### Configuration (config/)
- **db.js** - MongoDB connection setup using Mongoose

### Models (models/)
Database schemas defining the application data structure:
- **User.js** - User schema with authentication methods
- **Book.js** - Book schema with search indexes
- **Transaction.js** - Transaction schema for book issues/returns

### Controllers (controllers/)
Business logic for handling requests:
- **authController.js** - Registration, login, token management
- **userController.js** - User profile, user listing, status updates
- **bookController.js** - Book CRUD operations, search functionality
- **transactionController.js** - Issue/return books, transaction tracking
- **dashboardController.js** - Statistics and analytics

### Middleware (middleware/)
Request processing and validation:
- **authMiddleware.js** - JWT verification and token validation
- **roleMiddleware.js** - Role-based access control (admin/user)
- **errorMiddleware.js** - Centralized error handling
- **rateLimiter.js** - API rate limiting for protection

### Routes (routes/)
API endpoint definitions:
- **authRoutes.js** - POST /register, /login, GET /me
- **userRoutes.js** - User profile and management endpoints
- **bookRoutes.js** - Book CRUD and search endpoints
- **transactionRoutes.js** - Issue, return, and transaction endpoints
- **dashboardRoutes.js** - Statistics endpoints

### Utilities (utils/)
Helper functions:
- **generateToken.js** - JWT token creation
- **asyncHandler.js** - Async error handling wrapper

### Seed Data (seed/)
- **seedAdmin.js** - Database initialization with admin user and sample data

## 🎨 Frontend (client/)

### Root Configuration
- **index.html** - HTML entry point
- **package.json** - Frontend dependencies and scripts
- **vite.config.js** - Vite build configuration
- **tailwind.config.js** - Tailwind CSS customization
- **postcss.config.js** - PostCSS configuration
- **.env.example** - Environment variables template

### Source Code (src/)

#### Entry Point
- **main.jsx** - React app initialization
- **App.jsx** - Main routing and app wrapper
- **index.css** - Global styles and animations

#### Components (components/)
Reusable UI components:
- **Button.jsx** - Customizable button component with variants
- **Loading.jsx** - Loading spinner component
- **Modal.jsx** - Dialog modal with animations
- **SearchBar.jsx** - Search input with debouncing
- **BookCard.jsx** - Book display card component
- **EmptyState.jsx** - Empty state with animation
- **ProtectedRoute.jsx** - Route protection wrapper
- **Navbar.jsx** - Top navigation bar with theme toggle
- **Footer.jsx** - Footer with links and social media
- **Sidebar.jsx** - Admin sidebar navigation

#### Context (context/)
Global state management:
- **AuthContext.jsx** - Authentication state and methods
- **ThemeContext.jsx** - Dark/light mode state

#### Hooks (hooks/)
Custom React hooks:
- **useAuth.js** - Hook for accessing auth context
- **useTheme.js** - Hook for theme management
- **useDebounce.js** - Hook for debouncing search input

#### Services (services/)
API communication:
- **api.js** - Axios instance with interceptors
- **authService.js** - Authentication API calls
- **bookService.js** - Book-related API calls
- **transactionService.js** - Transaction API calls
- **userService.js** - User and dashboard API calls

#### Layouts (layouts/)
Page layout components:
- **PublicLayout.jsx** - Layout with navbar and footer
- **DashboardLayout.jsx** - Layout with sidebar for admin

#### Pages (pages/)
Full-page components:
- **Home.jsx** - Landing page with features and hero section
- **Login.jsx** - User login page
- **Register.jsx** - User registration page
- **Books.jsx** - Book browsing with search and filter
- **Profile.jsx** - User profile management
- **UserDashboard.jsx** - User's issued books and history
- **AdminDashboard.jsx** - Admin statistics and analytics

## 📊 Database Models Diagram

```
User
├── name
├── email
├── password (hashed)
├── phone
├── role (admin/user)
└── isActive

Book
├── title
├── isbn
├── author
├── category
├── publisher
├── description
├── coverImage
├── totalCopies
├── availableCopies
└── shelfLocation

Transaction
├── user (ref: User)
├── book (ref: Book)
├── issueDate
├── dueDate
├── returnDate
└── status (issued/returned/overdue)
```

## 🔄 API Route Map

```
POST   /api/auth/register          → authController.register
POST   /api/auth/login             → authController.login
GET    /api/auth/me                → authController.getMe

GET    /api/user/profile           → userController.getUserProfile
PUT    /api/user/profile           → userController.updateUserProfile
GET    /api/user                   → userController.getAllUsers (admin)
PUT    /api/user/:userId/status    → userController.updateUserStatus (admin)

GET    /api/books                  → bookController.getAllBooks
GET    /api/books/:id              → bookController.getBookById
POST   /api/books                  → bookController.addBook (admin)
PUT    /api/books/:id              → bookController.updateBook (admin)
DELETE /api/books/:id              → bookController.deleteBook (admin)
GET    /api/books/search           → bookController.searchBooks

POST   /api/transactions/issue     → transactionController.issueBook
PUT    /api/transactions/:id/return → transactionController.returnBook (admin)
GET    /api/transactions           → transactionController.getTransactions (admin)
GET    /api/transactions/my        → transactionController.getUserTransactions
GET    /api/transactions/overdue   → transactionController.getOverdueBooks (admin)

GET    /api/dashboard/stats        → dashboardController.getDashboardStats (admin)
```

## 📁 Complete File Tree

```
library-management-system/
│
├── README.md
├── SETUP_GUIDE.md
├── QUICKSTART.md
│
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   └── Transaction.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── bookController.js
│   │   ├── transactionController.js
│   │   └── dashboardController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimiter.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── dashboardRoutes.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── asyncHandler.js
│   │
│   └── seed/
│       └── seedAdmin.js
│
└── client/
    ├── index.html
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── components/
        │   ├── Button.jsx
        │   ├── Loading.jsx
        │   ├── Modal.jsx
        │   ├── SearchBar.jsx
        │   ├── BookCard.jsx
        │   ├── EmptyState.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   └── Sidebar.jsx
        │
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        │
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useTheme.js
        │   └── useDebounce.js
        │
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── bookService.js
        │   ├── transactionService.js
        │   └── userService.js
        │
        ├── layouts/
        │   ├── PublicLayout.jsx
        │   └── DashboardLayout.jsx
        │
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Books.jsx
            ├── Profile.jsx
            ├── UserDashboard.jsx
            └── AdminDashboard.jsx
```

## 🔗 Component Dependencies

### Key Component Relationships
- **ProtectedRoute** → AuthContext (checks authentication)
- **Navbar** → AuthContext, ThemeContext (user state, theme toggle)
- **Sidebar** → useAuth hook (navigation based on role)
- **BookCard** → Button component (nested usage)
- **Modal** → Button component (footer actions)
- **Pages** → Services (API calls)
- **Pages** → Hooks (state management)

## 📝 Code Organization Principles

1. **Separation of Concerns** - Controllers, services, components each have single responsibility
2. **Reusability** - Common components and utilities extracted
3. **DRY** - Don't Repeat Yourself - shared logic in services and hooks
4. **Error Handling** - Centralized middleware for errors
5. **Security** - Protected routes, input validation, secure tokens
6. **Performance** - Debouncing, pagination, MongoDB indexes

## 🎯 Key Features by File

| Feature | Backend File | Frontend Component |
|---------|--------------|-------------------|
| User Auth | authController.js | Login.jsx, Register.jsx |
| Book Search | bookController.js | Books.jsx |
| Issue Book | transactionController.js | BookCard.jsx |
| Admin Stats | dashboardController.js | AdminDashboard.jsx |
| User History | transactionController.js | UserDashboard.jsx |
| Theme Toggle | N/A | Navbar.jsx |
| Protected Routes | roleMiddleware.js | ProtectedRoute.jsx |

---

Use this guide to navigate the codebase and understand how components interact!
