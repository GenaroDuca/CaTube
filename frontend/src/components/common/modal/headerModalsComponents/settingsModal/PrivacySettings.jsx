import React, { useState, useEffect } from 'react';
import { VITE_API_URL } from "../../../../../../config";
import { useToast } from '../../../../../hooks/useToast';

const PrivacySettings = () => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Accept both snake_case and camelCase field names
          setIsPrivate(data?.is_private ?? data?.isPrivate ?? false);
          const channelIsHidden = data?.channel?.is_hidden ?? data?.channel?.isHidden ?? false;
          setIsHidden(channelIsHidden);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

    const handlePrivacyToggle = async () => {
    const newValue = !isPrivate;
    try {
      const response = await fetch(`${VITE_API_URL}/users/me/privacy`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ isPrivate: newValue })
      });
      if (response.ok) {
        setIsPrivate(newValue);
        showSuccess(`Account is now ${newValue ? 'Private' : 'Public'}`);
      } else {
        showError("Failed to update privacy settings");
      }
    } catch (error) {
      showError("Error updating privacy settings");
    }
  };

    const handleChannelVisibilityToggle = async () => {
    const newValue = !isHidden;
    try {
      const response = await fetch(`${VITE_API_URL}/users/me/channel-visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ isHidden: newValue })
      });
      if (response.ok) {
        setIsHidden(newValue);
        showSuccess(`Channel is now ${newValue ? 'Hidden' : 'Visible'}`);
      } else {
        showError("Failed to update channel visibility");
      }
    } catch (error) {
      showError("Error updating channel visibility");
    }
  };

  return (
    <section className="setting-section">
      <h2>Privacy</h2>
      <div className="setting-item">
        <h3>Private Account (CaTube Social)</h3>
        <label className="toggle-switch">
          <input type="checkbox" checked={isPrivate} onChange={handlePrivacyToggle} disabled={loading} />
          <span className="slider"></span>
        </label>
      </div>
      <p className="setting-description" style={{ fontSize: '12px', marginTop: '-15px' }}>If enabled, your account will not appear in CaTube Social searches.</p>

      <div className="setting-item">
        <h3>Hide my Channel</h3>
        <label className="toggle-switch">
          <input type="checkbox" checked={isHidden} onChange={handleChannelVisibilityToggle} disabled={loading} />
          <span className="slider"></span>
        </label>
      </div>
      <p className="setting-description" style={{ fontSize: '12px', marginTop: '-15px' }}>If enabled, your channel will not appear in search results or recent channels.</p>
    </section>
  );
};

export default PrivacySettings;