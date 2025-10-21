import { useState, useRef, useEffect } from 'react';

export function useOverlay(initialState = false, extraRefs = []) {
    const [isOpen, setIsOpen] = useState(initialState);
    const overlayRef = useRef(null);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen(prev => !prev);

    useEffect(() => {
    const handleClickOutside = (e) => {
        const clickedOutsideOverlay = overlayRef.current && !overlayRef.current.contains(e.target);
        const clickedInsideModal = e.target.closest('.modal-container');

        if (clickedOutsideOverlay && !clickedInsideModal) {
            close();
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                close();
                document.activeElement.blur();
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
