import React, { createContext, useContext, useState, useEffect } from 'react';

const TimezoneContext = createContext();

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

export const TimezoneProvider = ({ children }) => {
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    const saved = localStorage.getItem('timezone');
    return saved || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  useEffect(() => {
    localStorage.setItem('timezone', selectedTimezone);
  }, [selectedTimezone]);

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ];

  const updateTimezone = (timezone) => {
    setSelectedTimezone(timezone);
  };

  const value = {
    selectedTimezone,
    timezones,
    updateTimezone
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};




