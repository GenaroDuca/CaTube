import { useState, useCallback } from 'react';

export function useSidebarToggle(initialState = false) {
    const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(initialState);

    const toggleFriendMenu = useCallback(() => {
        setIsFriendMenuOpen(prev => !prev);
    }, []);

    return { isFriendMenuOpen, toggleFriendMenu };
}