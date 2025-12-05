// src/components/FriendMenu/MyProfileView.jsx
import { useState, useEffect, useRef } from 'react';
import { IoArrowBackCircle } from "react-icons/io5";
import { MdModeEditOutline } from "react-icons/md";
import { getAuthToken } from '../../../utils/auth';
import { VITE_API_URL } from '../../../../config';
import { useToast } from '../../../hooks/useToast';


const MyProfileView = ({ myUser, onBack, onSaveProfile, isLoading }) => {
    const [editedUsername, setEditedUsername] = useState(myUser?.userName || '');
    const [editedDescription, setEditedDescription] = useState(myUser?.description || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        if (myUser) {
            setEditedUsername(myUser.userName);
            setEditedDescription(myUser.description || '');
        }
    }, [myUser]);

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Función auxiliar para subir el avatar (utilizada dentro de handleSave)
    const uploadAvatar = async (file) => {
        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = getAuthToken();
            const response = await fetch(`${VITE_API_URL}/users/me/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to upload avatar');
            }

            const updatedUser = await response.json();
            return updatedUser.avatarUrl;
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showError('Please select a valid image file (JPEG, PNG, or WebP)');
            e.target.value = '';
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            e.target.value = '';
            return;
        }

        setSelectedFile(file);

        // Create preview
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
    };

    const handleSave = async () => {
        const updateData = {};
        let hasChanges = false;
        let newAvatarUrl = null;

        // 1. Verificar cambios de texto (username/description)
        if (editedUsername !== myUser.userName && editedUsername.trim() !== "") {
            updateData.username = editedUsername.trim();
            hasChanges = true;
        }

        if (editedDescription !== (myUser.description || '')) {
            updateData.description = editedDescription;
            hasChanges = true;
        }

        // 2. Verificar si hay un archivo de avatar seleccionado para subir
        if (selectedFile) {
            try {
                // Subir el avatar primero
                const uploadedUrl = await uploadAvatar(selectedFile);
                newAvatarUrl = uploadedUrl;
                hasChanges = true;

                // Limpiar la selección local y la vista previa después de la subida exitosa
                setSelectedFile(null);
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

            } catch (error) {
                console.error('Error uploading avatar during save:', error);
                showError(error.message || 'Failed to upload profile picture');
                // Si la subida del avatar falla, detenemos el proceso
                return;
            }
        }

        // 3. Aplicar cambios
        if (hasChanges) {
            if (newAvatarUrl) {
                updateData.avatarUrl = newAvatarUrl;
            }

            onSaveProfile(updateData);
            // showSuccess('Profile updated successfully!');
        }
    };

    const getAvatarUrl = () => {
        if (previewUrl) return previewUrl;
        if (myUser?.avatarUrl) return myUser.avatarUrl;
        return `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${myUser?.userName?.charAt(0)?.toUpperCase() || 'A'}.png`;
    };

    const isSaveDisabled = isLoading || isUploadingAvatar || editedUsername.trim() === "";

    return (
        <div className="dynamic-view profile-view my-profile-view">
            <button onClick={onBack} className="back-button" disabled={isSaveDisabled}>
                <IoArrowBackCircle size={28} color="#90b484" />
                <h4>Return to Friends</h4>
            </button>
            <div>
                <div>
                    <h2>{myUser?.userName}</h2>

                    <div className="profile-avatar-container">
                        <button
                            className="avatar-upload-button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSaveDisabled}
                            title="Change profile picture"
                        >
                            <MdModeEditOutline size={20} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <img
                            src={getAvatarUrl()}
                            alt={myUser?.userName || 'My Avatar'}
                            className="profile-large-avatar"
                        />

                    </div>
                    <div className='profile-edit-group'>
                        <label htmlFor="username-input">Username</label>
                        <input
                            id="username-input"
                            type="text"
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            placeholder="New Username"
                            disabled={isSaveDisabled}
                        />
                    </div>

                    <div className='profile-edit-group'>
                        <label htmlFor="description-textarea">Description</label>
                        <textarea
                            id="description-textarea"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            placeholder="Tell something about yourself..."
                            rows={4}
                            disabled={isSaveDisabled}
                        />

                    </div>
                </div>
                <div className="profile-actions-container">
                    <button
                        onClick={handleSave}
                        className="profile-save-btn"
                        title="Save Changes"
                        disabled={isSaveDisabled}
                    >
                        {isUploadingAvatar ? 'Uploading Avatar...' : isLoading ? 'Saving Profile...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyProfileView;