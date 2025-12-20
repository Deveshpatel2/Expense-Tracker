# Expense Tracker (Spendora) - Technical Overview

## 📋 Project Overview
**Spendora** is a full-stack expense tracking application that helps users manage their finances, track expenses, set budgets, and analyze spending patterns. The application features a modern React frontend and a robust Node.js/Express backend with SQLite database.

---

## 🎨 FRONTEND TECHNOLOGIES

### Core Framework & Libraries
- **React 19.1.0** - Modern UI library with latest features
- **React DOM 19.1.0** - React rendering engine
- **React Router DOM 7.6.2** - Client-side routing and navigation
- **React Scripts 5.0.1** - Build tooling and development server

### State Management & Context
- **React Context API** - Global state management for:
  - Dark Mode (`DarkModeContext`)
  - Currency (`CurrencyContext`)
  - Notifications (`NotificationProvider`)
  - Loading States (`LoadingProvider`)

### HTTP Client
- **Axios 1.9.0** - Promise-based HTTP client for API calls

### UI Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **PostCSS 8.5.5** - CSS processing
- **Autoprefixer 10.4.21** - Automatic vendor prefixing
- **Custom CSS Modules** - Component-specific styling

### Data Visualization
- **Recharts 3.1.2** - Charting library for analytics and reports

### File Processing
- **PapaParse 5.5.3** - CSV parsing and generation
- **XLSX 0.18.5** - Excel file handling
- **PDF.js 5.4.54** - PDF parsing and processing
- **PDF-Parse 1.1.1** - PDF text extraction

### Testing
- **React Testing Library 16.3.0** - Component testing
- **Jest DOM 6.6.3** - DOM testing utilities
- **User Event 13.5.0** - User interaction simulation

### Frontend Features
- ✅ Dark Mode Support
- ✅ Multi-currency Support
- ✅ Responsive Design (Mobile-first)
- ✅ Real-time Notifications
- ✅ Loading States Management
- ✅ Form Validation
- ✅ File Upload (Receipts)
- ✅ Data Export (CSV, PDF, Excel)
- ✅ Advanced Search & Filtering
- ✅ Bulk Operations
- ✅ Category Management
- ✅ Expense Templates
- ✅ Analytics Dashboard

---

## ⚙️ BACKEND TECHNOLOGIES

### Primary Backend Stack
- **Node.js** - JavaScript runtime environment
- **Express.js 4.18.2** - Web application framework
- **SQLite3 5.1.6** - Lightweight relational database

### Alternative Backend (Spring Boot)
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Enterprise Java framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Database abstraction layer
- **H2 Database** - In-memory database (for development)

### Authentication & Security
- **JSON Web Token (JWT) 9.0.2** - Stateless authentication
- **BCrypt.js 2.4.3** - Password hashing (10 rounds)
- **Express Rate Limit 8.1.0** - API rate limiting:
  - General: 100 requests/15 minutes
  - Auth: 5 requests/15 minutes
  - Upload: 10 requests/15 minutes

### File Handling
- **Multer 1.4.5** - File upload middleware
  - Max file size: 10MB
  - Storage: Disk-based (`uploads/` directory)

### Email Services
- **Nodemailer 6.9.7** - Email sending service
  - Email verification
  - Password reset
  - HTML email templates

### Utilities
- **UUID 9.0.1** - Unique identifier generation
- **CORS 2.8.5** - Cross-origin resource sharing

### Development Tools
- **Nodemon 3.0.1** - Auto-restart on file changes

---

## 🗄️ DATABASE

### Primary Database: SQLite
- **Type**: Relational Database (File-based)
- **File**: `expense_tracker.db`
- **Advantages**: 
  - Zero configuration
  - Lightweight
  - Perfect for small to medium applications
  - ACID compliant

### Database Schema

#### 1. **Users Table**
```sql
- id (TEXT PRIMARY KEY)
- firstName, lastName (TEXT)
- email (TEXT UNIQUE)
- password (TEXT - hashed)
- profilePicture (TEXT)
- isGoogleUser (BOOLEAN)
- isGuest (BOOLEAN)
- isEmailVerified (BOOLEAN)
- emailVerificationToken (TEXT)
- emailVerificationExpires (DATETIME)
- failedLoginAttempts (INTEGER)
- accountLockedUntil (DATETIME)
- timezone (TEXT)
- createdAt, updatedAt (DATETIME)
```

#### 2. **Expenses Table**
```sql
- id (TEXT PRIMARY KEY)
- description (TEXT)
- amount (REAL)
- category (TEXT)
- expenseDate (DATE)
- notes (TEXT)
- currency (TEXT)
- userId (TEXT - FOREIGN KEY)
- createdAt, updatedAt (DATETIME)
```

#### 3. **Budgets Table**
```sql
- id (TEXT PRIMARY KEY)
- userId (TEXT - FOREIGN KEY)
- category (TEXT)
- amount (REAL)
- currency (TEXT)
- budgetMonth (DATE)
- notes (TEXT)
- alertThreshold (INTEGER - default 80%)
- isTemplate (BOOLEAN)
- templateName (TEXT)
- createdAt, updatedAt (DATETIME)
```

#### 4. **Recurring Expenses Table**
```sql
- id (TEXT PRIMARY KEY)
- userId (TEXT - FOREIGN KEY)
- description (TEXT)
- amount (REAL)
- category (TEXT)
- pattern (TEXT - weekly/monthly/yearly)
- startDate (DATE)
- endDate (DATE - nullable)
- notes (TEXT)
- currency (TEXT)
- isActive (BOOLEAN)
- createdAt, updatedAt (DATETIME)
```

#### 5. **Categories Table**
```sql
- id (TEXT PRIMARY KEY)
- userId (TEXT - FOREIGN KEY)
- name (TEXT)
- description (TEXT)
- color (TEXT - hex code)
- icon (TEXT)
- isDefault (BOOLEAN)
- isActive (BOOLEAN)
- createdAt, updatedAt (DATETIME)
- UNIQUE(userId, name)
```

#### 6. **User Settings Table**
```sql
- id (TEXT PRIMARY KEY)
- userId (TEXT - FOREIGN KEY)
- settingKey (TEXT)
- settingValue (TEXT)
- settingType (TEXT)
- createdAt, updatedAt (DATETIME)
- UNIQUE(userId, settingKey)
```

### Default Categories
The system includes 10 default categories:
1. Food & Dining
2. Transportation
3. Shopping
4. Entertainment
5. Healthcare
6. Utilities
7. Housing
8. Education
9. Travel
10. Other

---

## 🏗️ ARCHITECTURE

### Architecture Pattern
- **RESTful API** - Stateless API design
- **Client-Server Architecture** - Separation of concerns
- **JWT-based Authentication** - Stateless authentication

### Frontend Architecture
```
Frontend (React)
├── Pages (Dashboard)
├── Components (Reusable UI components)
│   ├── Expense Management
│   ├── Budget Management
│   ├── Analytics & Reports
│   ├── User Management
│   └── Utilities
├── Context (Global State)
├── Services (API calls)
└── Utils (Helper functions)
```

### Backend Architecture
```
Backend (Node.js/Express)
├── Routes (API endpoints)
├── Middleware (Authentication, Validation, Rate Limiting)
├── Database Layer (SQLite)
└── Utilities (JWT, Email, File Upload)
```

### API Communication
- **Protocol**: HTTP/HTTPS
- **Data Format**: JSON
- **Authentication**: Bearer Token (JWT)
- **CORS**: Configured for localhost:3000 and localhost:3004

---

## 🔒 SECURITY FEATURES

### Authentication & Authorization
1. **JWT Tokens**
   - 24-hour expiration
   - Secure token generation and validation
   - Token stored in localStorage (frontend)

2. **Password Security**
   - BCrypt hashing (10 salt rounds)
   - Password complexity requirements:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
     - At least one special character

3. **Account Security**
   - Account lockout after 5 failed login attempts
   - 30-minute lockout period
   - Failed attempt tracking
   - Email verification system

4. **Rate Limiting**
   - Prevents brute force attacks
   - Protects against DDoS
   - Different limits for different endpoints

5. **Input Validation**
   - Server-side validation
   - SQL injection prevention
   - XSS protection
   - Input sanitization

6. **CORS Configuration**
   - Restricted to specific origins
   - Credentials enabled

7. **File Upload Security**
   - File size limits (10MB)
   - File type validation
   - Secure file storage

---

## 🚀 KEY FEATURES

### Expense Management
- ✅ Add/Edit/Delete expenses
- ✅ Categorize expenses
- ✅ Multi-currency support
- ✅ Date-based filtering
- ✅ Search functionality
- ✅ Bulk operations
- ✅ Expense templates
- ✅ Recurring expenses

### Budget Management
- ✅ Create monthly budgets
- ✅ Budget templates
- ✅ Budget alerts (80% threshold)
- ✅ Budget vs Actual tracking
- ✅ Copy budgets to next month
- ✅ Budget summary dashboard

### Analytics & Reporting
- ✅ Spending overview (today/week/month/year)
- ✅ Category breakdown
- ✅ Monthly trends (12 months)
- ✅ Top expenses
- ✅ Insights (month-over-month comparison)
- ✅ Visual charts and graphs

### Data Management
- ✅ CSV Export/Import
- ✅ PDF Report Generation
- ✅ Excel file support
- ✅ Data backup (JSON)
- ✅ Receipt upload and management

### User Features
- ✅ User registration/login
- ✅ Guest mode
- ✅ Google OAuth (configured)
- ✅ Email verification
- ✅ Password reset
- ✅ Profile management
- ✅ User settings
- ✅ Dark mode
- ✅ Multi-currency support

### Advanced Features
- ✅ Category management (custom categories)
- ✅ Category merge/split
- ✅ Advanced search with filters
- ✅ Receipt OCR (mock implementation)
- ✅ Expense history
- ✅ Mobile-responsive design

---

## 📡 API ENDPOINTS

### Authentication (`/api/auth/`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /guest` - Guest user creation
- `POST /google` - Google OAuth login
- `GET /verify-email` - Email verification
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Reset password with token

### Expenses (`/api/expenses/`)
- `GET /` - Get all expenses (with filters)
- `POST /` - Create expense
- `GET /:id` - Get expense by ID
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense
- `GET /statistics/totals` - Get total spending by currency
- `GET /statistics/categories` - Get spending by category

### Budgets (`/api/budgets/`)
- `GET /` - Get all budgets
- `POST /` - Create budget
- `GET /:id` - Get budget by ID
- `PUT /:id` - Update budget
- `DELETE /:id` - Delete budget
- `GET /summary` - Get budget summary for month
- `GET /templates` - Get budget templates
- `POST /templates/:templateName/create` - Create budgets from template
- `POST /copy-to-next-month` - Copy budgets to next month

### Recurring Expenses (`/api/recurring-expenses/`)
- `GET /` - Get all recurring expenses
- `POST /` - Create recurring expense
- `PUT /:id` - Update recurring expense
- `DELETE /:id` - Delete recurring expense
- `POST /generate` - Generate expenses from recurring patterns

### Analytics (`/api/analytics/`)
- `GET /spending-overview` - Overall spending statistics
- `GET /category-breakdown` - Category-wise spending
- `GET /monthly-trend` - Monthly spending trends
- `GET /top-expenses` - Top expenses list
- `GET /insights` - Spending insights

### Data Management (`/api/data/`)
- `GET /export/csv` - Export data as CSV
- `POST /import/csv` - Import data from CSV
- `GET /export/pdf` - Generate PDF report
- `GET /backup` - Export all data as JSON

### File Upload (`/api/upload/`)
- `POST /receipt` - Upload receipt image

### User (`/api/user/`)
- `PUT /settings` - Update user settings
- `GET /export` - Export user data

---

## 🛠️ DEVELOPMENT TOOLS

### Package Management
- **NPM** - Node Package Manager
- **Concurrently 8.2.2** - Run multiple commands simultaneously

### Build Tools
- **React Scripts** - Create React App build system
- **Webpack** (via React Scripts) - Module bundler
- **Babel** (via React Scripts) - JavaScript compiler

### Code Quality
- **ESLint** - JavaScript linting
- **Prettier** (implicit) - Code formatting

### Version Control
- **Git** - Source control (configured)

---

## 📦 DEPENDENCIES SUMMARY

### Frontend Dependencies (20 packages)
- React ecosystem (React, React-DOM, React Router)
- UI libraries (Recharts, Tailwind CSS)
- File processing (PapaParse, XLSX, PDF.js)
- HTTP client (Axios)
- Testing libraries

### Backend Dependencies (9 packages)
- Express.js and middleware
- Database (SQLite3)
- Security (JWT, BCrypt)
- File handling (Multer)
- Email (Nodemailer)
- Utilities (UUID, CORS)

---

## 🌐 DEPLOYMENT CONSIDERATIONS

### Environment Variables
- `PORT` - Server port (default: 8080)
- `EMAIL_USER` - Email service username
- `EMAIL_PASS` - Email service password
- `JWT_SECRET` - JWT signing secret

### Production Checklist
- ✅ Environment variables configured
- ✅ Database migrations ready
- ✅ CORS configured for production domain
- ✅ Rate limiting tuned
- ✅ File upload limits set
- ✅ Error handling implemented
- ✅ Logging configured

### Scalability Considerations
- SQLite suitable for small-medium scale
- Can migrate to PostgreSQL/MySQL for larger scale
- Stateless API design supports horizontal scaling
- JWT tokens enable load balancing

---

## 📊 PROJECT STATISTICS

- **Frontend Components**: 30+ reusable components
- **API Endpoints**: 40+ RESTful endpoints
- **Database Tables**: 6 main tables
- **Supported Currencies**: 10 (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL)
- **Default Categories**: 10 predefined categories
- **File Size Limit**: 10MB per upload

---

## 🎯 TECHNICAL HIGHLIGHTS FOR INTERVIEW

### What Makes This Project Stand Out:

1. **Full-Stack Expertise**
   - Modern React frontend with hooks and context
   - RESTful API design
   - Database design and optimization

2. **Security Implementation**
   - JWT authentication
   - Password hashing
   - Rate limiting
   - Input validation

3. **User Experience**
   - Dark mode
   - Responsive design
   - Real-time updates
   - Error handling

4. **Data Management**
   - CRUD operations
   - Data export/import
   - File handling
   - Analytics

5. **Code Quality**
   - Modular architecture
   - Reusable components
   - Error handling
   - Input validation

---

## 🔄 PROJECT WORKFLOW

### Development Workflow
1. Frontend runs on `localhost:3000`
2. Backend runs on `localhost:8080`
3. Both servers run concurrently via `npm start`
4. Hot reload enabled for development

### Data Flow
1. User interacts with React frontend
2. Axios makes HTTP request to Express backend
3. Express validates request and authenticates user
4. SQLite database processes query
5. Response sent back to frontend
6. React updates UI with new data

---

## 📝 NOTES FOR INTERVIEW

### Strengths to Highlight:
- ✅ Clean, modular code structure
- ✅ Security best practices implemented
- ✅ Comprehensive feature set
- ✅ Modern tech stack
- ✅ Responsive design
- ✅ Error handling and validation
- ✅ RESTful API design
- ✅ Database normalization

### Potential Improvements to Mention:
- Could add unit/integration tests
- Could implement caching (Redis)
- Could add real-time features (WebSockets)
- Could migrate to PostgreSQL for production
- Could add Docker containerization
- Could implement CI/CD pipeline

---

**Project Name**: Spendora (Expense Tracker)  
**Type**: Full-Stack Web Application  
**Architecture**: RESTful API with React SPA  
**Database**: SQLite (with Spring Boot/H2 alternative)  
**Status**: Production-ready




