// src/hooks/useSidebarToggleFriends.js

import React, { useState, useCallback, useContext } from 'react';

// 1. Crear el Contexto
const SidebarToggleContext = React.createContext(undefined);

// 2. Crear el Provider (El componente que almacenará el estado)
export function SidebarToggleProvider({ children, initialState = false }) {
    const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(initialState);

    // Funciones estables
    const toggleFriendMenu = useCallback(() => {
        setIsFriendMenuOpen(prev => !prev);
    }, []);

    const openFriendMenu = useCallback(() => {
        setIsFriendMenuOpen(true);
    }, []);

    const closeFriendMenu = useCallback(() => {
        setIsFriendMenuOpen(false);
    }, []);

    // 3. Crear el valor del contexto
    const contextValue = {
        isFriendMenuOpen,
        toggleFriendMenu,
        openFriendMenu,
        closeFriendMenu,
    };

    return (
        <SidebarToggleContext.Provider value={contextValue}>
            {children}
        </SidebarToggleContext.Provider>
    );
}

// 4. Crear el Hook personalizado para usar el contexto
export function useSidebarToggle() {
    const context = useContext(SidebarToggleContext);
    
    // Si el hook se usa fuera del Provider, lanzamos un error claro
    if (context === undefined) {
        throw new Error('useSidebarToggle debe usarse dentro de un SidebarToggleProvider');
    }

    return context;
}