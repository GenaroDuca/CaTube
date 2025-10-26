import React from 'react';
import { useModal } from './ModalContext'; // Importa el hook desde el archivo de contexto
import SettingsModal from '../modal/headerModalsComponents/SettingsModal';
import HelpModal from '../modal/headerModalsComponents/HelpModal';
import FeedbackModal from '../modal/headerModalsComponents/FeedbackModal'
import EditProductModal from '../modal/storeModal/EditProductModal'
import AddProductModal from '../modal/storeModal/AddProductModal'
import ModalDeleteAccount from '../modal/headerModalsComponents/ModalDeleteAccount';
import CreateVideoModal from '../modal/videoModalComponents/createVideoModal';
import EditVideoModal from '../modal/videoModalComponents/editVideoModal';
import CreateStoreModal from '../modal/storeModal/CreateStoreModal';


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
        case 'createstore':
            return <CreateStoreModal onClose={closeModal} />;
        case 'editproduct':
            return <EditProductModal onClose={closeModal} />;
        case 'addproduct':
            return <AddProductModal onClose={closeModal} />;
        case 'delete':
            return <ModalDeleteAccount onClose={closeModal} />;
        case 'createvideo':
            return <CreateVideoModal onClose={closeModal} />;
        case 'editvideo':
            return <EditVideoModal onClose={closeModal} />;
        default:
            return null;
    }
};

export default ModalRenderer;