# Smart Financial Manager - System Documentation

**Version:** 1.0.0  
**Last Updated:** February 6, 2026  
**Author:** Development Team

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Backend Structure](#backend-structure)
5. [Frontend Structure](#frontend-structure)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Authentication & Authorization](#authentication--authorization)
9. [Key Features](#key-features)
10. [Deployment & Setup](#deployment--setup)

---

## Project Overview

**Smart Financial Manager** is a full-stack web application designed to help users track their personal finances, manage transactions, set budgets, and receive financial insights through an AI-powered assistant.

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Transaction Management**: Track income and expenses with categorization
- **Financial Analytics**: Dashboard with KPI cards, spending analysis, and financial health indicators
- **Admin Panel**: Role-based access control for super_admin and admin users
- **Admin Invitations**: Super admins can invite users to become admins
- **AI Chat Assistant**: Natural language processing for financial insights
- **Password Management**: Secure password reset functionality
- **Multi-role Support**: User, Admin, and Super Admin roles

---

## System Architecture

The application follows a **client-server architecture** with:

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)                │
│  (User Interface, Components, Pages, Services)          │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST
                        │ (JWT Authentication)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                Backend (Node.js + Express)              │
│  (Controllers, Routes, Middleware, Services)            │
└───────────────────────┬─────────────────────────────────┘
                        │ Mongoose ODM
                        │ (CRUD Operations)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  MongoDB Database                       │
│  (Collections: Users, Transactions, AdminInvitations,   │
│                AdminAudit)                              │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB 9.1.1 with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 3.0.3
- **Email Service**: Nodemailer 7.0.12
- **CORS**: cors 2.8.5
- **Environment**: dotenv 17.2.3
- **Development**: Nodemon 3.1.11

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.12.0
- **HTTP Client**: Axios 1.13.2
- **Charts**: Recharts 3.6.0
- **CSS**: Tailwind CSS 3.4.17
- **Icon Library**: Lucide React 0.563.0
- **PDF Generation**: jsPDF 4.1.0 with jspdf-autotable 5.0.7
- **Post-CSS**: autoprefixer 10.4.24, PostCSS 8.5.6

---

## Backend Structure

### Directory Layout
```
backend/
├── server.js                          # Express app entry point
├── package.json                       # Dependencies & scripts
├── config/
│   └── db.js                         # MongoDB connection & super_admin check
├── controllers/
│   ├── userController.js             # User registration, login, password reset
│   ├── transactionController.js      # Transaction CRUD operations
│   ├── adminController.js            # Admin user management & invitations
│   ├── adminAcceptController.js      # Admin invite acceptance logic
│   ├── adminAnalyticsController.js   # Admin analytics operations
│   ├── adminTransactionController.js # Admin transaction access & analytics
│   └── aiController.js               # AI chat assistant logic
├── models/
│   ├── User.js                       # User schema (name, email, password, role, tokens)
│   ├── Transaction.js                # Transaction schema (user, type, category, amount, note)
│   ├── AdminInvitation.js            # Admin invitation schema (email, token, expiry)
│   └── AdminAudit.js                 # Audit log for role changes (PROMOTE, DEMOTE)
├── routes/
│   ├── userRoutes.js                 # Auth endpoints
│   ├── transactionRoutes.js          # Transaction CRUD endpoints
│   ├── adminRoutes.js                # Admin management endpoints
│   ├── adminAnalyticsRoutes.js       # Admin analytics endpoints
│   └── aiRoutes.js                   # AI assistant endpoints
├── middleware/
│   ├── authMiddleware.js             # JWT token verification (protect)
│   ├── requireAuth.js                # Auth requirement check
│   ├── requireAdmin.js               # Admin role verification
│   ├── requireSuperAdmin.js          # Super admin role verification
│   └── adminMiddleware.js            # Additional admin checks
├── Services/
│   └── emailService.js               # Email sending service
└── utils/
    ├── generateResetToken.js         # Password reset token generation
    ├── sendEmail.js                  # Email utility
    └── sendResetEmail.js             # Password reset email sender
```

### Key Files Explained

#### `server.js`
- Initializes Express application
- Configures CORS and JSON middleware
- Registers all API routes
- Connects to MongoDB
- Runs on port 5000 (default) or PORT env variable

#### `config/db.js`
- Establishes MongoDB connection
- Validates super_admin existence on startup
- Security check: Warns if super_admin count ≠ 1

#### `middleware/authMiddleware.js` - `protect()` middleware
- Extracts Bearer token from Authorization header
- Verifies JWT signature using JWT_SECRET
- Populates `req.user` with user data (excluding password)

#### `middleware/requireAuth.js`
- Simple auth check
- Extracts user ID and role from token

#### `middleware/requireAdmin.js`
- Ensures user role is `admin` or `super_admin`
- Returns 403 Forbidden if not

#### `middleware/requireSuperAdmin.js`
- Strict role check for `super_admin` only
- Used for sensitive operations like inviting admins

---

## Frontend Structure

### Directory Layout
```
frontend/
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── eslint.config.js                  # ESLint rules
├── postcss.config.js                 # PostCSS & Autoprefixer config
├── index.html                        # Entry HTML
├── package.json                      # Dependencies & scripts
├── src/
│   ├── main.jsx                      # React DOM render entry
│   ├── App.jsx                       # Main app component with routing
│   ├── App.css                       # Global styles
│   ├── index.css                     # Base styles
│   ├── assets/                       # Static assets (images, icons)
│   ├── components/
│   │   ├── IncomeExpenseChart.jsx   # Chart component for income/expense
│   │   ├── InLineRegister.jsx        # Inline registration form
│   │   ├── TransactionForm.jsx       # Transaction input form
│   │   ├── TransactionItem.jsx       # Single transaction display
│   │   └── layout/
│   │       ├── AppLayout.jsx         # Main app layout wrapper
│   │       ├── Sidebar.jsx           # Navigation sidebar
│   │       └── Topbar.jsx            # Top navigation bar
│   ├── pages/
│   │   ├── Login.jsx                 # Login page with guest mode
│   │   ├── Register.jsx              # User registration page
│   │   ├── Dashboard.jsx             # User financial overview & KPIs
│   │   ├── Transactions.jsx          # Transaction list with filters
│   │   ├── Analytics.jsx             # Financial analytics & charts
│   │   ├── Budgets.jsx               # Budget management (stub)
│   │   ├── Recurring.jsx             # Recurring transactions (stub)
│   │   ├── Reports.jsx               # Financial reports (stub)
│   │   ├── Goals.jsx                 # Financial goals (stub)
│   │   ├── Settings.jsx              # User settings (stub)
│   │   ├── ForgotPassword.jsx        # Password recovery page
│   │   ├── ResetPassword.jsx         # Password reset page
│   │   ├── AdminDashboard.jsx        # Admin user & analytics panel
│   │   ├── AdminAcceptInvite.jsx     # Admin invitation acceptance
│   │   └── Dashboard.css             # Dashboard styles
│   ├── routes/
│   │   └── ProtectedRoute.jsx        # Route guard component
│   ├── services/
│   │   └── api.js                    # Axios API client
│   ├── styles/
│   │   └── login.css                 # Login page styles
│   └── utils/
│       └── auth.js                   # Authentication utilities
└── public/                           # Public static files
```

### Key Pages

#### **Login.jsx**
- Email/password login form
- Guest mode option (demo access)
- Role-based redirect (admin → /admin, user → /dashboard)
- Error handling & loading states

#### **Register.jsx**
- User registration form
- Name, email, password inputs
- Password confirmation validation
- Axios-based API calls

#### **Dashboard.jsx**
- **KPI Cards**: Total income, total expenses, current balance
- **Financial Health Indicator**: Visual indicator of spending rate
  - Green (Healthy): < 70% spending rate
  - Yellow (Watch): 70-90% spending rate
  - Red (Critical): > 90% spending rate
- Recent transactions list
- Responsive grid layout

#### **Transactions.jsx**
- Complete transaction list with sorting by date
- **Filtering**: By month and transaction type (income/expense)
- **Category Badges**: Visual icons and colors for each category
- Add/Edit/Delete transactions with modal form
- Responsive table layout

#### **AdminDashboard.jsx**
- **User Management**: View all users with roles
- **User Transactions**: Click user to view their transactions
- **Admin Analytics**: Overview statistics
- **Role Actions**: Promote/demote users to/from admin
- Confirmation dialogs for sensitive actions

#### **AdminAcceptInvite.jsx**
- Token validation from URL params
- Accept admin invitation & auto-promote
- Error handling for expired/invalid invites

---

## Database Schema

### User Model
```javascript
{
  _id: ObjectId (auto),
  name: String (default: ""),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  role: String (enum: ["super_admin", "admin", "user"], default: "user"),
  resetPasswordToken: String (optional, hashed),
  resetPasswordExpires: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Transaction Model
```javascript
{
  _id: ObjectId (auto),
  user: ObjectId (ref: "User", required),
  type: String (required, enum: ["income", "expense"]),
  category: String (required, e.g., "food", "rent", "salary"),
  amount: Number (required),
  note: String (optional),
  date: Date (default: Date.now()),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### AdminInvitation Model
```javascript
{
  _id: ObjectId (auto),
  email: String (required, lowercase, trim),
  role: String (enum: ["admin", "super_admin"], default: "admin"),
  tokenHash: String (required, bcrypt-hashed),
  expiresAt: Date (required, 30 minutes from creation),
  used: Boolean (default: false),
  createdBy: ObjectId (ref: "User", required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### AdminAudit Model
```javascript
{
  _id: ObjectId (auto),
  action: String (enum: ["PROMOTE", "DEMOTE"], required),
  performedBy: ObjectId (ref: "User", required),
  targetUser: ObjectId (ref: "User", required),
  performedByRole: String (enum: ["admin", "super_admin"], required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexing
- **User**: Unique index on `email`
- **Transaction**: Indexed on `user` and `date` for efficient queries
- **AdminInvitation**: TTL index on `expiresAt` (optional auto-delete after expiration)
- **AdminAudit**: Indexed on `performedBy` and `targetUser` for audit trail lookups

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require `Authorization: Bearer <JWT_TOKEN>` header.

---

### User Routes (`/users`)

#### 1. **Register User**
```
POST /users/register
Body: { name, email, password }
Response: { _id, name, email }
Status: 201 Created
```

#### 2. **Login User**
```
POST /users/login
Body: { email, password }
Response: { _id, name, email, role, token }
Status: 200 OK
```

#### 3. **Forgot Password**
```
POST /users/forgot-password
Body: { email }
Response: { message: "If email exists, reset link sent" }
Status: 200 OK
Notes:
  - Sends email with reset link
  - Does not reveal user existence
  - Reset link expires in 15 minutes
```

#### 4. **Reset Password**
```
POST /users/reset-password
Body: { token, newPassword }
Response: { message: "Password reset successfully" }
Status: 200 OK
Validation:
  - Password >= 8 characters
  - At least 1 uppercase letter
  - At least 1 number
```

---

### Transaction Routes (`/transactions`)

#### 1. **Create Transaction**
```
POST /transactions
Auth: Required
Body: { type, category, amount, note, date }
Response: { _id, user, type, category, amount, note, date, createdAt, updatedAt }
Status: 201 Created
```

#### 2. **Get All User Transactions**
```
GET /transactions
Auth: Required
Response: [ { ...transaction objects... } ]
Sorting: By date (descending)
Status: 200 OK
```

#### 3. **Update Transaction**
```
PUT /transactions/:id
Auth: Required
Body: { type, category, amount, note, date }
Response: { ...updated transaction... }
Status: 200 OK
Notes: Only transaction owner can update
```

#### 4. **Delete Transaction**
```
DELETE /transactions/:id
Auth: Required
Response: { message: "Transaction deleted" }
Status: 200 OK
Notes: Only transaction owner can delete
```

---

### Admin Routes (`/admin`)

#### 1. **Get All Users** (Admin+)
```
GET /admin/users
Auth: Required (admin or super_admin role)
Response: [ { _id, name, email, role, createdAt, updatedAt }, ... ]
Status: 200 OK
```

#### 2. **Get User Transactions** (Admin+)
```
GET /admin/users/:userId/transactions
Auth: Required (admin or super_admin role)
Response: [ { ...transaction objects... } ]
Status: 200 OK
```

#### 3. **Get All Transactions** (Admin+)
```
GET /admin/transactions
Auth: Required (admin or super_admin role)
Response: [ { ...all transactions from all users... } ]
Status: 200 OK
```

#### 4. **Invite Admin** (Super Admin Only)
```
POST /admin/invite
Auth: Required (super_admin role only)
Body: { email }
Response: { message: "Admin invitation email sent" }
Status: 201 Created
Notes:
  - Generates secure token hash
  - Sends invite link to email
  - Invite expires in 30 minutes
```

#### 5. **Accept Admin Invite**
```
POST /admin/accept-invite
Auth: Not required (token-based)
Body: { token }
Response: { message: "Admin role granted", userId }
Status: 200 OK
Validation:
  - Token must not be expired
  - Token must not be already used
  - User must exist
  - User must not already be an admin
```

#### 6. **Promote User to Admin** (Admin+)
```
PATCH /admin/promote/:userId
Auth: Required (admin or super_admin role)
Response: { message: "User promoted" }
Status: 200 OK
Notes: Creates audit log entry
```

#### 7. **Demote Admin to User** (Admin+)
```
PATCH /admin/demote/:userId
Auth: Required (admin or super_admin role)
Response: { message: "User demoted" }
Status: 200 OK
Notes: Creates audit log entry
```

#### 8. **Get Admin Analytics** (Admin+)
```
GET /admin/analytics/overview
Auth: Required (admin or super_admin role)
Response: {
  totalUsers: Number,
  totalTransactions: Number,
  totalIncome: Number,
  totalExpenses: Number,
  topCategories: [ { category, total }, ... ]
}
Status: 200 OK
```

---

### AI Routes (`/ai`)

#### 1. **Chat with AI Assistant**
```
POST /ai/chat
Auth: Required
Body: { message }
Response: { reply: "AI generated response" }
Status: 200 OK

Intent Detection:
  - "most spend" → TOP_EXPENSE_CATEGORY
    Returns: "You spent the most on [category] (Rs. [amount])"
  
  - "summary"/"month" → MONTHLY_SUMMARY
    Returns: "Income: Rs. [X], Expenses: Rs. [Y]"
  
  - "save" → SAVING_ADVICE
    Returns: Personalized savings recommendations
  
  - "balance" → BALANCE_ANALYSIS
    Returns: Current balance and analysis
  
  - Others → UNKNOWN
    Returns: "I didn't understand that. Try asking about expenses or balance."
```

---

## Authentication & Authorization

### JWT Token Structure
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { id: userId, role: userRole, iat: timestamp, exp: timestamp }
Secret: process.env.JWT_SECRET
```

### Token Expiration
- JWT expires in **7 days** after login
- Password reset token expires in **15 minutes**
- Admin invitation token expires in **30 minutes**

### Role Hierarchy
```
super_admin
  ├── Can invite admins
  ├── Can promote/demote any user
  ├── Can view all users and transactions
  └── Full system access

admin
  ├── Can promote/demote users
  ├── Can view all users and transactions
  ├── Can access admin analytics
  └── Read-only or limited write access

user
  ├── Can create/edit/delete own transactions
  ├── Can view own dashboard & analytics
  └── Limited to personal data only
```

### Security Features
- ✅ **Password Hashing**: bcrypt with salt rounds = 10
- ✅ **Token Hashing**: Admin invitation tokens stored as bcrypt hashes
- ✅ **Password Reset Tokens**: Hashed with SHA-256
- ✅ **Email Validation**: Sensitive operations reveal no user existence
- ✅ **User Isolation**: Users can only access their own transactions
- ✅ **Audit Logging**: All role changes tracked in AdminAudit collection
- ✅ **CORS**: Restricted to frontend origin

---

## Key Features

### 1. User Management
- ✅ Registration with email validation
- ✅ Secure login with JWT
- ✅ Password reset via email
- ✅ Guest mode for demo access
- ✅ Role-based access control (user, admin, super_admin)

### 2. Transaction Management
- ✅ Create income/expense transactions
- ✅ Categorize transactions (food, rent, salary, etc.)
- ✅ Add notes to transactions
- ✅ Edit existing transactions
- ✅ Delete transactions
- ✅ Filter by month and type
- ✅ Sort by date (newest first)

### 3. Financial Dashboard
- ✅ KPI Cards (Total Income, Expenses, Balance)
- ✅ Spending Rate percentage
- ✅ Financial Health Status (Healthy/Watch/Critical)
- ✅ Recent transactions list
- ✅ Responsive design

### 4. Analytics & Reporting
- ✅ Income/Expense charts (Recharts)
- ✅ Category-wise spending breakdown
- ✅ Monthly summaries
- ✅ Admin-level analytics (total users, transactions, income/expenses)
- ✅ PDF export capability

### 5. Admin Panel
- ✅ User management (view all users)
- ✅ User transaction viewing
- ✅ Role promotion/demotion
- ✅ Admin invitation system
- ✅ System-wide analytics
- ✅ Audit trail (role changes)

### 6. AI Chat Assistant
- ✅ Natural language processing
- ✅ Intent detection
- ✅ Financial insights
- ✅ Spending analysis
- ✅ Balance queries

### 7. Placeholder Features (Stub Pages)
- 📌 Budgets Management
- 📌 Recurring Transactions
- 📌 Financial Reports
- 📌 Goals & Target Setting
- 📌 Settings & Preferences

---

## Deployment & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas or Local MongoDB
- Gmail account (for email service) or alternative email provider
- Modern web browser

### Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Email Service (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_specific_password

# URLs
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:5173

# Server
PORT=5000
NODE_ENV=development
```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   (Uses nodemon for auto-reload)

4. **Or start production server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   (Vite dev server on http://localhost:5173)

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

### Database Setup

1. **Create MongoDB cluster** on MongoDB Atlas
2. **Get connection string** with credentials
3. **Update `.env`** with `MONGO_URI`
4. **Server auto-validates** super_admin count on startup

### Email Service Setup

1. **Enable 2-factor authentication** on Gmail
2. **Generate app-specific password**: https://myaccount.google.com/apppasswords
3. **Update `.env`** with `EMAIL_USER` and `EMAIL_PASS`

### Running Full Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access application at: `http://localhost:5173`

---

## Project Structure Summary

```
Smart Financial Manager/
├── README.md
├── SYSTEM_DOCUMENTATION.md  ← You are here
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── Services/
│   └── utils/
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── components/
    │   ├── pages/
    │   ├── routes/
    │   ├── services/
    │   ├── styles/
    │   └── utils/
    └── public/
```

---

## Common Workflows

### User Registration & Login Flow
```
User Input Email/Password
    ↓
Register Endpoint (hash password)
    ↓
Create User Document
    ↓
Redirect to Login
    ↓
Login Endpoint (verify password)
    ↓
Generate JWT Token
    ↓
Store Token + User in localStorage
    ↓
Redirect to Dashboard (role-based)
```

### Transaction Creation Flow
```
User Fills Transaction Form
    ↓
TransactionForm Component
    ↓
POST /api/transactions
    ↓
Middleware: protect() - validates JWT
    ↓
Controller: addTransaction()
    ↓
Save to MongoDB
    ↓
Return transaction object
    ↓
Update Frontend State
    ↓
Refresh Transaction List
```

### Admin Invitation Flow
```
Super Admin Enters Email
    ↓
POST /admin/invite
    ↓
Generate Random Token (32 bytes)
    ↓
Hash Token with bcrypt
    ↓
Create AdminInvitation Document
    ↓
Send Email with Link + Token
    ↓
User Clicks Link
    ↓
AdminAcceptInvite Page Extracts Token
    ↓
POST /admin/accept-invite with token
    ↓
Compare Raw Token with Hashed in DB
    ↓
Promote User Role to "admin"
    ↓
Create AdminAudit Entry
    ↓
Mark Invitation as Used
    ↓
Redirect User to Admin Dashboard
```

### Password Reset Flow
```
User Enters Email
    ↓
POST /forgot-password
    ↓
Generate Reset Token (crypto)
    ↓
Hash Token with SHA-256
    ↓
Save Token Hash + Expiry (15 min)
    ↓
Send Email with Reset Link
    ↓
User Clicks Link
    ↓
ResetPassword Page Shows Form
    ↓
User Enters New Password
    ↓
POST /reset-password with token
    ↓
Hash Token, Compare with DB
    ↓
Validate Password Strength
    ↓
Update User Password
    ↓
Clear Reset Token Fields
    ↓
Redirect to Login
```

---

## Error Handling

### HTTP Status Codes Used
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input/validation error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Example Error Response
```json
{
  "message": "Not authorized, token failed"
}
```

---

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields (email, user_id, date)
- Mongoose lean() queries for read-only operations
- Pagination available for large transaction lists

### Frontend Optimization
- Vite for fast bundling
- React.lazy() for code splitting (ready for implementation)
- Tailwind CSS for minimal CSS output
- Recharts optimized for large datasets

### API Best Practices
- Bearer token in Authorization header
- RESTful endpoint naming
- Proper HTTP methods and status codes
- Error messages in JSON format

---

## Future Enhancement Ideas

1. **Budget Management** - Set spending limits per category
2. **Recurring Transactions** - Automate periodic transactions
3. **Report Generation** - Monthly/yearly PDF exports
4. **Goal Tracking** - Financial goals and milestones
5. **Savings Plans** - Automatic savings recommendations
6. **Multi-currency** - Support for different currencies
7. **Data Export** - CSV/Excel export functionality
8. **Mobile App** - React Native mobile version
9. **Two-Factor Auth** - Enhanced security
10. **Notifications** - Email/SMS alerts for budget warnings

---

## Support & Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
- Verify MONGO_URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

**2. Email Not Sending**
- Verify Gmail app password
- Check EMAIL_USER and EMAIL_PASS in .env
- Ensure Less Secure App Access is enabled (or use app password)

**3. JWT Token Invalid**
- Check JWT_SECRET is same across restarts
- Verify token not expired (7 days)
- Clear localStorage and re-login

**4. CORS Error**
- Verify frontend URL in FRONTEND_URL env variable
- Check backend CORS configuration in server.js

**5. Port Already in Use**
- Change PORT in .env
- Or kill process using port 5000: `lsof -ti:5000 | xargs kill -9`

---

## License

Proprietary - Smart Financial Manager  
All rights reserved © 2026

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 6, 2026 | Initial system documentation |

---

**Documentation Generated:** February 6, 2026  
**For questions or updates, please contact the development team.**
