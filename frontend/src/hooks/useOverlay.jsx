import { useState, useRef, useEffect } from 'react';

export function useOverlay(initialState = false) {
    const [isOpen, setIsOpen] = useState(initialState);
    const overlayRef = useRef(null);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (e) => {
        if (overlayRef.current && !overlayRef.current.contains(e.target)) {
            close();
        }
        };

        const handleEscape = (e) => {
        if (e.key === 'Escape') {
            close();
            document.activeElement.blur(); // remove focus from button/input
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    return {
        isOpen,
        open,
        close,
        toggle,
        overlayRef,
    };
}