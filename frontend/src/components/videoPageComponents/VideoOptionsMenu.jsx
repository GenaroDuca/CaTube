import React, { useState, useEffect, useRef } from 'react';
import { SlOptionsVertical } from "react-icons/sl";
import { MdModeEditOutline, MdDelete } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useModal } from "../../components/common/modal/ModalContext";
import { VITE_API_URL } from "../../../config";
import { useToast } from "../../hooks/useToast";
import { useNavigate } from 'react-router-dom';
import './VideoOptionsMenu.css';

export default function VideoOptionsMenu({ videoId, title, description, thumbnail, tags, contentType, ownerId }) {
    const [open, setOpen] = useState(false);
    const { openModal } = useModal();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const currentUserId = localStorage.getItem('userId');
    const isOwner = currentUserId && ownerId && currentUserId === ownerId;

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    if (!isOwner) return null;

    const handleEdit = () => {
        setOpen(false);
        openModal('editvideo', {
            videoId,
            title,
            description,
            thumbnail,
            initialTags: tags,
            contentType
        });
    };

    const handleDelete = () => {
        setOpen(false);
        openModal('confirm', {
            title: contentType === 'Shorts' ? 'Delete Short' : 'Delete Video',
            message: `Are you sure you want to delete the ${contentType === 'Shorts' ? 'short' : 'video'} "${title}"?`,
            confirmText: contentType === 'Shorts' ? 'Delete Short' : 'Delete Video',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('accessToken');
                    const response = await fetch(`${VITE_API_URL}/videos/${videoId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to delete video');
                    }
                    showSuccess(`${contentType === 'Shorts' ? 'Short' : 'Video'} deleted successfully`);

                    // Redirect after delete
                    openModal(null); // Close the modal
                    if (contentType === 'Shorts') {
                        window.location.reload();
                    } else {
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Error deleting video:', error);
                    showError(`Error deleting ${contentType === 'Shorts' ? 'short' : 'video'}.`);
                }
            },
        });
    };

    return (
        <div className="video-options-wrapper" ref={menuRef}>
            <div className={`video-options-expandable ${open ? "open" : ""}`}>
                {!open && (
                    <div
                        className="video-options-btn"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true); }}
                    >
                        <SlOptionsVertical color='#777878' size={20} />
                    </div>
                )}

                {open && (
                    <div className="video-options-content">
                        <div className="video-options-header">
                            <h4>Options</h4>
                            <div
                                className="close-btn"
                                role="button"
                                tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') setOpen(false); }}
                            >
                                <IoClose size={18} />
                            </div>
                        </div>

                        <div
                            className="video-option-item"
                            onClick={handleEdit}
                            role="button"
                            tabIndex={0}
                        >
                            <MdModeEditOutline size={18} />
                            <span>Edit {contentType === 'Shorts' ? 'Short' : 'Video'}</span>
                        </div>

                        <div
                            className="video-option-item delete"
                            onClick={handleDelete}
                            role="button"
                            tabIndex={0}
                        >
                            <MdDelete size={18} />
                            <span>Delete {contentType === 'Shorts' ? 'Short' : 'Video'}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
