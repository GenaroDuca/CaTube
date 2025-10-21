import React, { createContext, useState, useContext } from 'react';

// 1. Create and Export the Context
export const SidebarContext = createContext();

// 2. Define the Provider Component
export const SidebarProvider = ({ children }) => {
    // Estado para el sidebar principal
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Estado para el menú de amigos
    const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(false);
    // Estado para el menú de usuario (el nuevo menú ts-sidebar)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    
    const toggleFriendMenu = () => setIsFriendMenuOpen(prev => !prev);
    const openFriendMenu = () => setIsFriendMenuOpen(true);
    const closeFriendMenu = () => setIsFriendMenuOpen(false);

    // Funciones para el Menú de Usuario
    const toggleUserMenu = () => setIsUserMenuOpen(prev => !prev);
    const openUserMenu = () => setIsUserMenuOpen(true);
    const closeUserMenu = () => setIsUserMenuOpen(false);

    const contextValue = {
        isSidebarOpen,
        toggleSidebar,
        isFriendMenuOpen,
        toggleFriendMenu,
        openFriendMenu,
        closeFriendMenu,
        isUserMenuOpen,
        toggleUserMenu,
        openUserMenu,
        closeUserMenu,
    };

    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    );
};

// 3. Define and Export the Custom Hook
// This is the CRITICAL part that solves the "does not provide an export named 'useSidebarToggle'" error.
export const useSidebarToggle = () => {
    const context = useContext(SidebarContext);
    
    // Optional: Error check
    if (context === undefined) {
        throw new Error('useSidebarToggle must be used within a SidebarProvider');
    }
    
    return context;
};