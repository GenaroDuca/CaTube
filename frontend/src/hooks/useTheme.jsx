// Archivo: src/hooks/useTheme.jsx (CÓDIGO CORREGIDO Y ÚNICO)

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('catube-dark-mode');
        // Si hay algo en localStorage, lo usamos. Si no, Dark Mode (true) por defecto.
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        // Aplica la clase CSS 'light-mode' al <body> para que CSS sepa qué tema usar.
        if (isDarkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }

        // Guarda la preferencia en localStorage.
        localStorage.setItem('catube-dark-mode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const value = {
        isDarkMode,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe usarse dentro de ThemeProvider');
    }
    return context;
};