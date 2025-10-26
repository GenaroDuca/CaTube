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
import ProductDeleteConfirmModal from "../modal/storeModal/ProductDeleteConfirmModal"

const ModalRenderer = () => {
    const { modalState, closeModal } = useModal();
    const { isOpen, modalType, modalProps } = modalState;

    if (!isOpen) return null;

    const renderModal = (Component) => {
        return <Component onClose={closeModal} {...modalProps} />;
    };

    switch (modalType) {
        case 'settings':
            return renderModal(SettingsModal);
        case 'help':
            return renderModal(HelpModal);
        case 'feedback':
            return renderModal(FeedbackModal);
        case 'createstore':
            return renderModal(CreateStoreModal);
        case 'editproduct':
            return renderModal(EditProductModal);
        case 'addproduct':
            return renderModal(AddProductModal);
        case 'deleteaccount':
            return renderModal(ModalDeleteAccount);
        case 'createvideo':
            return renderModal(CreateVideoModal);
        case 'editvideo':
            return renderModal(EditVideoModal);
        case 'deleteproductconfirm':
            return renderModal(ProductDeleteConfirmModal);
        default:
            return null;
    }
};

export default ModalRenderer;