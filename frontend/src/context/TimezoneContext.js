import React, { createContext, useContext, useState, useEffect } from 'react';

const TimezoneContext = createContext();

export const useTimezone = () => useContext(TimezoneContext);

export const TimezoneProvider = ({ children }) => {
    const [selectedTimezone, setSelectedTimezone] = useState(() => {
        const savedTimezone = localStorage.getItem('selectedTimezone');
        return savedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    });

    const timezones = [
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'London (GMT/BST)' },
        { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
        { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
        { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
        { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
        { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
        { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)' },
        { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)' },
        { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)' },
        { value: 'Europe/Prague', label: 'Prague (CET/CEST)' },
        { value: 'Europe/Warsaw', label: 'Warsaw (CET/CEST)' },
        { value: 'Europe/Budapest', label: 'Budapest (CET/CEST)' },
        { value: 'Europe/Athens', label: 'Athens (EET/EEST)' },
        { value: 'Europe/Istanbul', label: 'Istanbul (TRT)' },
        { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
        { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
        { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
        { value: 'Asia/Seoul', label: 'Seoul (KST)' },
        { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (IST)' },
        { value: 'Asia/Dubai', label: 'Dubai (GST)' },
        { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
        { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
        { value: 'Asia/Manila', label: 'Manila (PHT)' },
        { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
        { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
        { value: 'Australia/Perth', label: 'Perth (AWST)' },
        { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
        { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
        { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
        { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)' },
        { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
        { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
        { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
        { value: 'America/Lima', label: 'Lima (PET)' },
        { value: 'America/Bogota', label: 'Bogotá (COT)' },
        { value: 'Africa/Cairo', label: 'Cairo (EET)' },
        { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
        { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
        { value: 'Africa/Casablanca', label: 'Casablanca (WET)' },
        { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' }
    ];

    useEffect(() => {
        localStorage.setItem('selectedTimezone', selectedTimezone);
    }, [selectedTimezone]);

    const updateTimezone = (timezone) => {
        setSelectedTimezone(timezone);
    };

    const getCurrentTimezone = () => {
        return timezones.find(tz => tz.value === selectedTimezone) || timezones[0];
    };

    const formatDate = (date, options = {}) => {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: selectedTimezone,
            ...options
        }).format(new Date(date));
    };

    const formatTime = (date, options = {}) => {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: selectedTimezone,
            hour: '2-digit',
            minute: '2-digit',
            ...options
        }).format(new Date(date));
    };

    const getCurrentTime = () => {
        return new Date().toLocaleString('en-US', {
            timeZone: selectedTimezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <TimezoneContext.Provider value={{
            selectedTimezone,
            timezones,
            updateTimezone,
            getCurrentTimezone,
            formatDate,
            formatTime,
            getCurrentTime
        }}>
            {children}
        </TimezoneContext.Provider>
    );
};

