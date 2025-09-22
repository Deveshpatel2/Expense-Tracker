import React from 'react';
import './PasswordStrengthIndicator.css';

const PasswordStrengthIndicator = ({ password }) => {
  const getPasswordStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { strength: 'Weak', color: 'red', percentage: 20 };
    if (score <= 3) return { strength: 'Fair', color: 'orange', percentage: 40 };
    if (score <= 4) return { strength: 'Good', color: 'yellow', percentage: 60 };
    return { strength: 'Strong', color: 'green', percentage: 80 };
  };

  const getStrengthColor = (color) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getTextColor = (color) => {
    switch (color) {
      case 'red': return 'text-red-600';
      case 'orange': return 'text-orange-600';
      case 'yellow': return 'text-yellow-600';
      case 'green': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!password) return null;

  const { strength, color, percentage } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
        <span className={`font-medium ${getTextColor(color)}`}>{strength}</span>
      </div>
      <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(color)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;

