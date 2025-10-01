import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        modalType: null,
    });

    const openModal = (type) => {
        setModalState({ isOpen: true, modalType: type });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, modalType: null });
    };

    return (
        <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);