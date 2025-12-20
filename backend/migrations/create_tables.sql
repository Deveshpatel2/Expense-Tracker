-- PostgreSQL Schema for Expense Tracker
-- Run this script to create all tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "profilePicture" TEXT,
    "isGoogleUser" BOOLEAN DEFAULT FALSE,
    "isGuest" BOOLEAN DEFAULT FALSE,
    "isEmailVerified" BOOLEAN DEFAULT FALSE,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP,
    "failedLoginAttempts" INTEGER DEFAULT 0,
    "accountLockedUntil" TIMESTAMP,
    timezone VARCHAR(50) DEFAULT 'UTC',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(255) PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    "expenseDate" DATE NOT NULL,
    notes TEXT,
    currency VARCHAR(10) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    "budgetMonth" DATE NOT NULL,
    notes TEXT,
    "alertThreshold" INTEGER DEFAULT 80,
    "isTemplate" BOOLEAN DEFAULT FALSE,
    "templateName" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Recurring expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    pattern VARCHAR(50) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    notes TEXT,
    currency VARCHAR(10) NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(50) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'tag',
    "isDefault" BOOLEAN DEFAULT FALSE,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE("userId", name)
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "settingKey" VARCHAR(255) NOT NULL,
    "settingValue" TEXT,
    "settingType" VARCHAR(50) DEFAULT 'string',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE("userId", "settingKey")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses("userId");
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses("expenseDate");
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets("userId");
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets("budgetMonth");
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories("userId");
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses("userId");
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings("userId");



