# Expense Tracker Frontend

A modern, responsive expense tracking web application built with React, Tailwind CSS, and React Router. This application helps users manage their personal finances by tracking expenses, categorizing spending, and generating detailed reports.

## ✨ Features

- **User Authentication**: Secure login and registration system
- **Expense Management**: Add, view, and delete expenses with detailed information
- **Smart Categorization**: Pre-defined expense categories with color coding
- **Advanced Filtering**: Search, filter, and sort expenses by various criteria
- **Comprehensive Reporting**: Visual charts and insights for spending analysis
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Instant updates when adding or deleting expenses

## 🚀 Tech Stack

- **Frontend Framework**: React 19.1.0
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 7.6.2
- **HTTP Client**: Axios 1.9.0
- **State Management**: React Context API
- **Build Tool**: Create React App
- **Package Manager**: npm

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Backend API** running (see API Configuration section)

## 🛠️ Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd expense-tracker-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## ⚙️ Configuration

### API Configuration

The application expects a backend API running on `http://localhost:3001`. Update the API endpoints in the following files if your backend runs on a different port:

- `src/components/Login.jsx` - Line 42
- `src/components/UserRegister.jsx` - Line 47
- `src/components/ExpenseForm.jsx` - Line 58
- `src/components/ExpenseList.jsx` - Line 89
- `src/pages/Dashboard.jsx` - Line 35

### Environment Variables

Create a `.env` file in the root directory to customize API endpoints:

```env
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_API_VERSION=v1
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ExpenseForm.jsx     # Form for adding new expenses
│   ├── ExpenseList.jsx     # List view with filtering and sorting
│   ├── Login.jsx           # User authentication form
│   ├── Report.jsx          # Analytics and reporting dashboard
│   └── UserRegister.jsx    # User registration form
├── context/            # React Context for state management
│   └── AuthContext.js      # Authentication state and methods
├── pages/              # Page components
│   └── Dashboard.jsx       # Main dashboard with navigation
├── App.js              # Main application component with routing
├── App.css             # Global styles and custom CSS
└── index.js            # Application entry point
```

## 🔐 Authentication

The application uses JWT tokens for authentication. Users can:

- **Register**: Create a new account with email and password
- **Login**: Sign in with existing credentials
- **Protected Routes**: Access dashboard only when authenticated
- **Logout**: Clear session and return to login

## 💰 Expense Management

### Adding Expenses
- **Description**: Brief description of the expense
- **Amount**: Numeric amount with decimal support
- **Category**: Pre-defined spending categories
- **Date**: Date picker for expense tracking
- **Notes**: Optional additional information

### Expense Categories
- Food & Dining 🍽️
- Transportation 🚗
- Shopping 🛍️
- Entertainment 🎬
- Healthcare 🏥
- Utilities ⚡
- Housing 🏠
- Education 📚
- Travel ✈️
- Other 📝

## 📊 Reporting & Analytics

### Summary Cards
- Total expenses for the selected period
- Average expense amount
- Total number of transactions
- Top spending category

### Visual Charts
- Category breakdown with percentages
- Monthly spending trends
- Top 5 highest expenses

### Filtering Options
- Time range (week, month, quarter, year)
- Category-specific filtering
- Search functionality

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface using Tailwind CSS
- **Responsive Layout**: Mobile-first design that adapts to all screen sizes
- **Interactive Elements**: Hover effects, smooth transitions, and loading states
- **Color Coding**: Visual category identification with consistent color scheme
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## 🚀 Available Scripts

- **`npm start`**: Runs the app in development mode
- **`npm test`**: Launches the test runner
- **`npm run build`**: Builds the app for production
- **`npm run eject`**: Ejects from Create React App (not recommended)

## 🔧 Development

### Code Style
- Follow React best practices and hooks
- Use functional components with hooks
- Implement proper error handling
- Add loading states for better UX

### State Management
- Use React Context for global state (authentication)
- Local state for component-specific data
- Proper prop drilling and component composition

### Performance
- Memoized calculations for expensive operations
- Efficient filtering and sorting algorithms
- Optimized re-renders with proper dependencies

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The application includes:
- Unit tests for components
- Integration tests for user flows
- Accessibility testing

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Deploy to Vercel
1. Import your GitHub repository
2. Vercel will auto-detect React settings
3. Deploy with default configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify your backend API is running
3. Check network requests in browser dev tools
4. Ensure all dependencies are installed

## 🔮 Future Enhancements

- **Data Export**: CSV/PDF export functionality
- **Budget Tracking**: Set and monitor spending limits
- **Recurring Expenses**: Automatic expense scheduling
- **Receipt Upload**: Image upload and storage
- **Multi-currency**: Support for different currencies
- **Dark Mode**: Toggle between light and dark themes
- **Mobile App**: React Native version
- **Data Sync**: Cloud synchronization across devices

---

**Happy Expense Tracking! 💰📊**
