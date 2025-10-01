import React from 'react';
import '../../../styles/modals.css';

const FeedbackModal = ({ onClose }) => (
  <div className="right-menu-modal">
    <div className="feedback-modal-content">
      <header>
        <h1>Feedback</h1>
        <button onClick={onClose} className="close-right-menu-modal">
          <span className="material-symbols-outlined">do_not_disturb_on</span>
        </button>
      </header>

      <form action="mailto:catube@gmail.com" method="POST" encType="text/plain">
        <label htmlFor="feedback-email">Your email (optional):</label>
        <input
          type="email"
          id="feedback-email"
          name="email"
          placeholder="your@email.com"
        />

        <label htmlFor="feedback-text">Your feedback:</label>
        <textarea
          id="feedback-text"
          name="feedback"
          rows="4"
          required
          placeholder="Write your feedback here..."
        ></textarea>

        <label htmlFor="feedback-file">Add image (optional):</label>
        <input
          type="file"
          id="feedback-file"
          name="file"
          accept="image/*"
        />

        <button type="submit" className="submit-feedback-btn">
          Send Feedback
        </button>
      </form>
    </div>
  </div>
);

export default FeedbackModal;