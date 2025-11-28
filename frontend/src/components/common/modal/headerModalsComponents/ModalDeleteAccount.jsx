import React, { useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { VITE_API_URL } from "../../../../../config";
import { useToast } from "../../../../hooks/useToast";

const ModalDeleteAccount = ({ onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmationText, setConfirmationText] = useState('');
    const { showSuccess, showError } = useToast();

    async function handleDeleteAccount() {
        if (confirmationText !== 'DELETE') {
            showError('Please type DELETE to confirm.');
            return;
        }
        if (!password) {
            showError('Password is required.');
            return;
        }

        try {
            const response = await fetch(`${VITE_API_URL}/users/me`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                showSuccess('Account deleted successfully.');
                localStorage.clear();
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                showError(`Failed to delete account: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            showError('Error deleting account. Please try again later.');
            console.error('Delete account error:', error);
        }
    }

    return (
        <div className="create-store-modal">
            <div className="create-delete-content">
                <header>
                    <h1>Delete Account</h1>
                    <button type="button" onClick={onClose} className="close-create-store-modal">
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>
                <main className="delete-account-main">
                    <p>This action is irreversible. Please enter your password and type "DELETE" to confirm.</p>

                    <div className="input-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="input-group">
                        <label>Type "DELETE"</label>
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="DELETE"
                        />
                    </div>

                    <button
                        className="delete-account-btn-confirm"
                        onClick={handleDeleteAccount}
                        disabled={confirmationText !== 'DELETE' || !password}
                    >
                        Permanently Delete
                    </button>
                </main>
            </div>
        </div>
    );
};

export default ModalDeleteAccount;
