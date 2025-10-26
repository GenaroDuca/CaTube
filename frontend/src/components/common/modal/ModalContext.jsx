import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        modalType: null,
        modalProps: {}, 
    });

    const openModal = (type, props = {}) => {
        setModalState({ 
            isOpen: true, 
            modalType: type, 
            modalProps: props, 
        });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, modalType: null, modalProps: {} });
    };

    return (
        <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);