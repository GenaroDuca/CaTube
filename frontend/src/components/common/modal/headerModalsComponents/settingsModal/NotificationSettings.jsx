import React from 'react';

const NotificationSettings = () => {
  const options = [
    'Email Notifications',
    'Push Notifications',
    'Mentions',
    'New Followers',
    'Newsletter'
  ];

  return (
    <section className="setting-section">
      <h2>Notifications</h2>
      {options.map((label, i) => (
        <div className="setting-item" key={i}>
          <span>{label}</span>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked={i < 3} />
            <span className="slider"></span>
          </label>
        </div>
      ))}
    </section>
  );
};

export default NotificationSettings;