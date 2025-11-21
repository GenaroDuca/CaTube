import React, { useState } from 'react';
import AccountSettings from './settingsModal/AccountSettings';
import NotificationSettings from './settingsModal/NotificationSettings';
import PrivacySettings from './settingsModal/PrivacySettings';
import PaymentHistory from './settingsModal/PaymentHistory';
import AdvancedSettings from './settingsModal/AdvancedSettings';
import '../modals.css';
import { IoIosCloseCircle } from "react-icons/io";

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
            <IoIosCloseCircle size={25} color="#1a1a1b" />
          </button>
        </header>
        <div className="settings-main-content">
          <nav>
            <ul>
              {['Account'].map(section => (
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