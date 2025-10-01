import React from 'react';

const AccountSettings = () => (
  <section className="setting-section">
    <h2>Account Settings</h2>
    <form className="change-password-form">
      <label htmlFor="current-password">Current Password:</label>
      <input type="password" id="current-password" placeholder="Current password" required />
      <a href="#">Forgot your password?</a>

      <label htmlFor="new-password">New Password:</label>
      <input type="password" id="new-password" placeholder="New password" required />
      <p>Min 8 characters, incl. upper, lower, num, symbol</p>

      <label htmlFor="confirm-new-password">Confirm New Password:</label>
      <input type="password" id="confirm-new-password" placeholder="Confirm new password" required />

      <button type="submit" className="soon">Change Password</button>
    </form>

    <div className="setting-section-btn-container">
      <button type="button" className="disable-account-btn soon">Disable Account</button>
      <button type="button" className="delete-account-btn soon">Delete Account</button>
    </div>
  </section>
);

export default AccountSettings;