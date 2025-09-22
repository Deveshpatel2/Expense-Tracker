# Expense Tracker

A full-stack expense tracking application with React frontend and Node.js/Express backend.

## 📁 Project Structure

```
Expense Tracker/
├── frontend/          # React.js frontend application
├── backend/           # Node.js/Express backend API
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Running the Application

1. **Start the Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend will run on `http://localhost:8080`

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will run on `http://localhost:3000`

3. **Access the Application:**
   - Open your browser and go to `http://localhost:3000`
   - The frontend will automatically connect to the backend API

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Context** - State management
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## ✨ Features

### Authentication
- User registration and login
- Guest user support
- Google Sign-In (mock)
- Password reset functionality
- Account deletion

### Expense Management
- Add expenses manually
- Upload receipt images/PDFs
- Edit existing expenses
- Delete expenses
- Multi-currency support
- Category-based organization

### Analytics & Reports
- Expense statistics by currency
- Category-wise breakdowns
- Date range filtering
- Visual charts and graphs
- Export capabilities

### User Experience
- Dark/Light mode toggle
- Responsive design
- Real-time updates
- Form validation
- Error handling

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/guest` - Create guest user
- `POST /api/auth/google` - Google sign-in

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Statistics
- `GET /api/expenses/statistics/totals` - Get totals by currency
- `GET /api/expenses/statistics/categories` - Get totals by category

### File Upload
- `POST /api/upload/receipt` - Upload receipt image/PDF

## 🗄️ Database

The application uses SQLite database with the following tables:
- **users** - User information and authentication
- **expenses** - Expense records with categories and currencies

## 🔧 Configuration

### Backend Configuration
- Port: 8080
- Database: SQLite (expense_tracker.db)
- JWT Secret: Configured in server.js
- CORS: Enabled for localhost:3000

### Frontend Configuration
- Port: 3000
- API Base URL: http://localhost:8080/api
- Build Tool: Create React App

## 📱 Usage

1. **Login/Register:** Create an account or use guest login
2. **Add Expenses:** Use manual entry or upload receipts
3. **View Expenses:** Browse your expense history
4. **Edit/Delete:** Modify or remove existing expenses
5. **View Reports:** Analyze your spending patterns
6. **Manage Profile:** Update settings and preferences

## 🧪 Testing

### Backend Testing
```bash
cd backend
# Test API endpoints using curl or Postman
curl http://localhost:8080/api/health
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build folder to your hosting service
```

### Backend Deployment
```bash
cd backend
# Deploy to your preferred hosting service (Heroku, AWS, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in each folder
- Review the API integration guide in `backend/API_INTEGRATION.md`
- Open an issue for bugs or feature requests

## 🔄 Alternative Backend

The project also includes a Spring Boot backend implementation in the `backend/src/` directory. To use it:

1. Install Java 17 and Maven
2. Navigate to `backend/src/main/java/com/expensetracker/`
3. Run `mvn spring-boot:run`

The Spring Boot backend provides the same API endpoints and functionality as the Node.js backend.
