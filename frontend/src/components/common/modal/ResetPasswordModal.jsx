import React, { useState } from 'react';
import './modals.css';
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from '../../../hooks/useToast';

const ResetPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showError('Please enter your email.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess('If the email is registered, you will receive a reset link.');
        setEmail('');
        onClose(); // Cierra el modal
      } else {
        showError(result.message || 'Error sending reset request.');
      }
    } catch (error) {
      showError('Failed to connect to the server: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="right-menu-modal">
      <div className="feedback-modal-content">
        <header>
          <h1>Reset your password</h1>
          <button onClick={onClose} className="close-right-menu-modal">
            <IoIosCloseCircle size={25} color="#1a1a1b" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="submit-feedback-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
