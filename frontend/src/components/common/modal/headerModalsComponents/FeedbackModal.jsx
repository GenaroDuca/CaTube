import React from 'react';
import '../modals.css';
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from '../../../../hooks/useToast';
import { VITE_API_URL } from "../../../../../config";
import { useState } from 'react';
import { getAuthToken } from "../../../../utils/auth";

const FeedbackModal = ({ onClose }) => {
  const { showSuccess, showError } = useToast();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendFeedback(e) {
    const token = getAuthToken();
    e.preventDefault();

    if (feedback.trim()) {
      setLoading(true);
      // Here you would typically send the feedback to your backend
      const response = await fetch(`${VITE_API_URL}/users/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback }),
      });

      if (response.ok) {
        showSuccess('Feedback sent successfully!');
        setLoading(false);
      } else {
        showError('Failed to send feedback. Please try again.');
      }

      onClose();
    } else {
      showError('Please write your feedback before submitting.');
    }
  };

  return (
    <div className="right-menu-modal">
      <div className="feedback-modal-content">
        <header>
          <h1>Feedback</h1>
          <button onClick={onClose} className="close-right-menu-modal">
            <IoIosCloseCircle size={25} color="#1a1a1b" />
          </button>
        </header>

        <form method="POST" encType="text/plain" onSubmit={handleSendFeedback}>
          <label htmlFor="feedback-text">Your feedback</label>
          <textarea
            id="feedback-text"
            name="feedback"
            rows="4"
            required
            placeholder="Write your feedback here..."
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>

          <button type="submit" className="submit-feedback-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;