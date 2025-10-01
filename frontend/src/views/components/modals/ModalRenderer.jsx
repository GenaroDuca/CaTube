import React from 'react';
import { useModal } from './ModalContext'; // Importa el hook desde el archivo de contexto
import SettingsModal from './SettingsModal';
import HelpModal from './HelpModal';
import FeedbackModal from './FeedbackModal'
import EditProductModal from './EditProductModal'
import AddProductModal from './AddProductModal'

const ModalRenderer = () => {
    const { modalState, closeModal } = useModal();

    if (!modalState.isOpen) return null;

    switch (modalState.modalType) {
        case 'settings':
            return <SettingsModal onClose={closeModal} />;
        case 'help':
            return <HelpModal onClose={closeModal} />;
        case 'feedback':
            return <FeedbackModal onClose={closeModal} />;
        case 'editproduct':
            return <EditProductModal onClose={closeModal} />;
        case 'addproduct':
            return <AddProductModal onClose={closeModal} />;
        default:
            return null;
    }
};

export default ModalRenderer;