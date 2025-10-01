import React, { useState } from 'react';
import AccountSettings from './settings/AccountSettings';
import NotificationSettings from './settings/NotificationSettings';
import PrivacySettings from './settings/PrivacySettings';
import PaymentHistory from './settings/PaymentHistory';
import AdvancedSettings from './settings/AdvancedSettings';
import '../../../styles/modals.css';

const SettingsModal = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('Account');

  const renderSection = () => {
    switch (activeSection) {
      case 'Account': return <AccountSettings />;
      case 'Notifications': return <NotificationSettings />;
      case 'Privacy': return <PrivacySettings />;
      case 'Payments': return <PaymentHistory />;
      case 'Advanced': return <AdvancedSettings />;
      default: return null;
    }
  };

  return (
    <div className="right-menu-modal">
      <div className="settings-modal-content">
        <header>
          <h1>Settings</h1>
          <button onClick={onClose} className="close-right-menu-modal">
            <span className="material-symbols-outlined">do_not_disturb_on</span>
          </button>
        </header>
        <div className="settings-main-content">
          <nav>
            <ul>
              {['Account', 'Notifications', 'Privacy', 'Payments', 'Advanced'].map(section => (
                <li key={section}>
                  <button
                    className={`settings-option-btn ${activeSection === section ? 'active' : ''}`}
                    onClick={() => setActiveSection(section)}
                  >
                    {section}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;