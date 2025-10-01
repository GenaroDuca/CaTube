import React from 'react';
import '../../../styles/modals.css';

const HelpModal = ({ onClose }) => (
  <div className="right-menu-modal">
    <div className="help-modal-content">
      <header>
        <h1>Help</h1>
        <button onClick={onClose} className="close-right-menu-modal">
          <span className="material-symbols-outlined">do_not_disturb_on</span>
        </button>
      </header>
      <div className="frequently-asked-questions">
        <h2>Frequently Asked Questions</h2>
        <p>Here are some common questions and answers to help you get started.</p>
        <details>
          <summary><strong>How do I upload a video?</strong></summary>
          <p>Go to your channel and click "Upload" or click "Create".</p>
        </details>
        <hr />
        <details>
          <summary><strong>How do I change my password?</strong></summary>
          <p>Go to Settings → Account and change your password.</p>
        </details>
        <hr />
        <details>
          <summary><strong>How do I report a problem?</strong></summary>
          <p>Use the feedback form or contact our support team directly.</p>
          <p>Contact us at <a href="mailto:catube@gmail.com">catube@gmail.com</a></p>
        </details>
      </div>
    </div>
  </div>
);

export default HelpModal;