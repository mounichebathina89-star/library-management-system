# 🚀 Setup & Running Guide

Complete step-by-step guide to setup and run the LibraryHub application.

## Prerequisites

Make sure you have installed:
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **MongoDB** - Either [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud) or [Local MongoDB](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

## Step 1: Clone/Extract the Project

Extract the project files to your desired location.

```bash
cd library-management-system
```

## Step 2: Backend Setup

### 2.1 Navigate to Server Directory
```bash
cd server
```

### 2.2 Install Dependencies
```bash
npm install
```

This installs:
- express, mongoose, bcryptjs, jsonwebtoken
- cors, helmet, morgan, express-rate-limit
- dotenv, nodemon (dev)

### 2.3 Create Environment File

```bash
# Copy the example file
cp .env.example .env
```

### 2.4 Configure MongoDB Connection

**Option A: Using MongoDB Atlas (Cloud)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free Tier)
4. Create a database user
5. Get connection string
6. Add your IP address to network access

**Option B: Using Local MongoDB**

```bash
# Make sure MongoDB is running
mongod

# Connection string format:
MONGO_URI=mongodb://localhost:27017/library-management
```

### 2.5 Edit .env File

Open `server/.env` and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secure_secret_key_change_this_in_production_12345
JWT_EXPIRES_IN=7d
```

Replace placeholders with your actual values.

### 2.6 Seed the Database

This will create an admin user and sample books:

```bash
npm run seed
```

**Output will show:**
```
✓ Admin user created: admin@library.com
✓ Sample users created: 3
✓ Sample books created: 8

✅ Database seeded successfully!

Admin Credentials:
Email: admin@library.com
Password: Admin@123
```

### 2.7 Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
✅ Server running on port 5000
📍 Base URL: http://localhost:5000
🔗 API Base: http://localhost:5000/api
MongoDB Connected: your-cluster.mongodb.net
```

✅ **Backend is now running!**

## Step 3: Frontend Setup

### 3.1 Open New Terminal and Navigate to Client

```bash
# From the root directory
cd client
```

### 3.2 Install Dependencies

```bash
npm install
```

This installs:
- react, react-dom, react-router-dom
- axios, framer-motion, lucide-react
- tailwindcss, vite, postcss, autoprefixer

### 3.3 Create Environment File

```bash
cp .env.example .env
```

### 3.4 Configure Environment

Open `client/.env` and set (if backend is on different host):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

(This is the default, only change if your backend is elsewhere)

### 3.5 Start Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v4.4.5  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Click the link or go to `http://localhost:5173` in your browser.

✅ **Frontend is now running!**

## Testing the Application

### 1. Access the Landing Page
- URL: `http://localhost:5173`
- You should see the LibraryHub landing page

### 2. Register a New Account
- Click "Register"
- Fill in: Name, Email, Phone, Password
- Submit the form
- You'll be automatically logged in

### 3. Browse Books
- Click "Books" in navigation or "Explore Books"
- View all available books
- Search by title, author, or ISBN
- Filter by category

### 4. Issue a Book
- Find a book with available copies
- Click "Issue Book"
- Confirm the transaction
- Check your dashboard to see the issued book

### 5. View Dashboard
- Click "Dashboard" after login
- See your issued books
- View due dates and borrowing history
- See overdue notifications if any

### 6. Admin Access (Use Demo Credentials)

**Login with:**
- Email: `admin@library.com`
- Password: `Admin@123`

**Admin Functions:**
- Click "Admin" in navigation
- View dashboard statistics
- Manage books (add, edit, delete)
- Manage users
- View all transactions
- Track overdue books

## Running Production Builds

### Frontend Production Build
```bash
cd client
npm run build
```

This creates a `dist/` folder with optimized production files.

### Backend Production Run
```bash
cd server
npm start
```

Make sure to:
- Set `NODE_ENV=production` in `.env`
- Use a strong `JWT_SECRET`
- Use a production MongoDB database

## Useful Commands

### Backend
```bash
npm run dev        # Start with auto-reload
npm start          # Production run
npm run seed       # Seed database
```

### Frontend
```bash
npm run dev        # Development with hot reload
npm run build      # Production build
npm run preview    # Preview production build
```

## Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:** Run `npm install` in the server directory

### Issue: "MongoDB connection failed"
**Solution:** 
- Check internet connection
- Verify MongoDB URI in `.env`
- Add your IP to MongoDB Atlas network access
- Ensure MongoDB is running (if local)

### Issue: "Port 5000 already in use"
**Solution:** Change PORT in `.env` or kill the process using port 5000

### Issue: Frontend shows "API Error"
**Solution:** 
- Check if backend is running
- Verify `VITE_API_BASE_URL` is correct
- Check browser console for error details
- Ensure CORS is enabled in backend

### Issue: "CORS error when calling API"
**Solution:** Backend `server.js` has CORS configured for `http://localhost:5173`

### Issue: Seed fails with "E11000 duplicate key error"
**Solution:** 
```bash
# Connect to MongoDB and clear collections
mongo
use library-management
db.users.deleteMany({})
db.books.deleteMany({})
db.transactions.deleteMany({})
exit

# Then run seed again
npm run seed
```

## Development Tips

### Modify Sample Data

Edit `server/seed/seedAdmin.js` to change:
- Admin credentials
- Sample users
- Sample books

Then re-run: `npm run seed`

### Database Reset

To clear all data and start fresh:

```bash
# MongoDB Atlas: Delete cluster and recreate
# Or in local MongoDB:
mongosh
use library-management
db.dropDatabase()
exit

# Then seed again
npm run seed
```

### Add New Book Categories

In `server/seed/seedAdmin.js`, modify the books array category field, then run seed again.

### Enable Dark Mode

The application includes dark mode toggle in the navbar - click the moon/sun icon.

## Next Steps

1. **Explore the code** - Review structure in README.md
2. **Customize** - Modify colors, add features, change database
3. **Deploy** - Follow deployment guide in README.md
4. **Extend** - Add new features like book reviews, ratings, etc.

## Performance Optimization

### Frontend
- Already optimized with Vite
- Lazy-loading routes
- Code-splitting automatic

### Backend
- MongoDB indexes configured
- Rate limiting enabled
- Response caching ready

## Security Checklist

Before production:
- [ ] Change JWT_SECRET to a strong value
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas (not local database)
- [ ] Enable HTTPS
- [ ] Set strong admin password
- [ ] Update CLIENT_URL to production domain
- [ ] Review CORS settings
- [ ] Set up rate limiting thresholds

## Support & Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in browser console
3. Check server terminal for backend errors
4. Review MongoDB logs for database issues
5. Check README.md for detailed documentation

---

**You're all set! Enjoy using LibraryHub! 📚✨**
