import React from 'react';

const AdvancedSettings = () => (
  <section className="setting-section">
    <h2>Advanced</h2>
    <div className="setting-item">
      <span>Language</span>
      <select className="settings-select">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  </section>
);

export default AdvancedSettings;