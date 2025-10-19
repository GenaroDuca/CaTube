import React from 'react';

const PrivacySettings = () => (
  <section className="setting-section">
    <h2>Privacy</h2>
    <div className="setting-item">
      <span>Show activity status</span>
      <label className="toggle-switch">
        <input type="checkbox" defaultChecked />
        <span className="slider"></span>
      </label>
    </div>
  </section>
);

export default PrivacySettings;