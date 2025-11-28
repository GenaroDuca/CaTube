import React from 'react';
import './modals.css';
import { useModal } from './ModalContext';
import SettingsModal from '../modal/headerModalsComponents/SettingsModal';
import HelpModal from '../modal/headerModalsComponents/HelpModal';
import FeedbackModal from '../modal/headerModalsComponents/FeedbackModal'
import EditProductModal from '../modal/storeModal/EditProductModal'
import AddProductModal from '../modal/storeModal/AddProductModal'
import CreateStoreModal from '../modal/storeModal/CreateStoreModal';
import CreateVideoModal from '../modal/videoModalComponents/createVideoModal';
import EditVideoModal from '../modal/videoModalComponents/editVideoModal';
import ConfirmModal from '../modal/ConfirmModal';
import ResetPasswordModal from '../modal/ResetPasswordModal';
import ModalDeleteAccount from '../modal/headerModalsComponents/ModalDeleteAccount';

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
        case 'editproduct':
            return renderModal(EditProductModal);
        case 'addproduct':
            return renderModal(AddProductModal);
        case 'createstore':
            return renderModal(CreateStoreModal);
        case 'createvideo':
            return renderModal(CreateVideoModal);
        case 'editvideo':
            return renderModal(EditVideoModal);
        case 'confirm':
            return renderModal(ConfirmModal);
        case 'reset-password':
            return renderModal(ResetPasswordModal);
        case 'delete-account':
            return renderModal(ModalDeleteAccount);
        default:
            return null;
    }
};

export default ModalRenderer;