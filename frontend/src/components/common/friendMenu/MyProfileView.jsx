// src/components/FriendMenu/MyProfileView.jsx
import { useState, useEffect } from 'react';
import { IoArrowBackCircle } from "react-icons/io5";
import { DEFAULT_AVATAR } from './constants'; // Importar de constantes


const MyProfileView = ({ myUser, onBack, onSaveProfile, isLoading }) => {
    const [editedUsername, setEditedUsername] = useState(myUser?.userName || '');
    const [editedDescription, setEditedDescription] = useState(myUser?.description || '');

    useEffect(() => {
        if (myUser) {
            setEditedUsername(myUser.userName);
            setEditedDescription(myUser.description || '');
        }
    }, [myUser]);

    const handleSave = () => {
        const updateData = {};
        let hasChanges = false;

        if (editedUsername !== myUser.userName && editedUsername.trim() !== "") {
            updateData.username = editedUsername.trim();
            hasChanges = true;
        }

        if (editedDescription !== (myUser.description || '')) {
            updateData.description = editedDescription;
            hasChanges = true;
        }

        if (hasChanges) {
            onSaveProfile(updateData);
        }
    };

    return (
        <div className="dynamic-view profile-view my-profile-view">
            <button onClick={onBack} className="back-button" disabled={isLoading}>
                <IoArrowBackCircle size={28} color="#90b484" />
                <h4>Return to Friends</h4>
            </button>
            <div>
                <div>
                    <h2>{myUser?.userName}</h2>

                    <img
                        src={myUser?.avatarUrl || DEFAULT_AVATAR}
                        alt={myUser?.userName || 'My Avatar'}
                        className="profile-large-avatar"
                    />

                    <div className='profile-edit-group'>
                        <label htmlFor="username-input">Username</label>
                        <input
                            id="username-input"
                            type="text"
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            placeholder="New Username"
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div className="profile-actions-container">
                    <button
                        onClick={handleSave}
                        className="profile-save-btn"
                        title="Save Changes"
                        disabled={isLoading || editedUsername.trim() === ""}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyProfileView;