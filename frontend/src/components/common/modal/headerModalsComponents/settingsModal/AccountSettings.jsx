import React, { useState } from 'react';
import { useModal } from "../../ModalContext";
import { useToast } from '../../../../../hooks/useToast';
import { VITE_API_URL } from "../../../../../../config"

const AccountSettings = () => {
  const { openModal } = useModal();
  const { showSuccess, showError } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }

    try {
      const response = await fetch(`${VITE_API_URL}/users/me/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        showSuccess("Password changed successfully.");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        showError(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error(error);
      showError("An error occurred.");
    }
  };

  const handleDeleteClick = () => {
    openModal('delete-account');
  };

  return (
    <section className="setting-section">
      <h2>Account</h2>
      <form className="change-password-form" onSubmit={handleChangePassword}>
        <label htmlFor="current-password">Current Password:</label>
        <input
          type="password"
          id="current-password"
          placeholder="Current password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <a type="button" onClick={() => openModal("reset-password")}>
          I forgot my password
        </a>

        <label htmlFor="new-password">New Password:</label>
        <input
          type="password"
          id="new-password"
          placeholder="New password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <p>Min 8 characters, incl. upper, lower, num, symbol</p>

        <label htmlFor="confirm-new-password">Confirm New Password:</label>
        <input
          type="password"
          id="confirm-new-password"
          placeholder="Confirm new password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" className="soon">Change Password</button>
      </form>

      <div className="setting-section-btn-container">
        <button
          type="button"
          className="delete-account-btn"
          onClick={handleDeleteClick}
        >
          Delete Account
        </button>
      </div>
    </section>
  );
}

export default AccountSettings;