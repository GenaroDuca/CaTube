import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonFill } from "react-icons/bs";
import { FaKey } from "react-icons/fa";
import { useNotifications } from '../common/Toasts/useNotifications.jsx';

const LoginForm = ({ togglePanel }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  //FeedbackToast
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginData = { username, password };
    
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // --- 1. LOGIN SUCCESS ---
        showSuccess(`¡Successfully logged in, Welcome ${username}!`);
        localStorage.setItem('accessToken', result.access_token);
        
        // Save user/channel data
        if (result.user && result.user.channel && result.user.channel.channel_id) {
          localStorage.setItem('channelId', result.user.channel.channel_id);
          localStorage.setItem('username', result.user.username);
          localStorage.setItem('userId', result.user.user_id);
          navigate('/');
        } else {
          showError('Login successful, but there was an issue retrieving your channel data.')
          console.log(result);
        }
      
      } else {
        // --- 2. LOGIN FAILED (Response Not OK) ---
        const errorMessage = result.message || 'Unknown error';

        // 🔥 CRITICAL: Check for the specific verification message from the backend
        if (errorMessage.includes('Please verify your email address to log in.')) {
            
            // Show a custom toast with a call to action
            showError("Unverified user, please verify your email!");
            
            // OPTIONAL: Navigate user to a page explaining the verification process
            // navigate('/pending-verification');

        } else if (typeof errorMessage === 'string') {
            // General login error (e.g., "Invalid credentials" or "User not found")
            showError('Login failed: ' + errorMessage);
        } else {
            // Error with validation array (NestJS default for DTO validation)
            showError('Login failed. Please check your inputs.');
        }
      }

    } catch (error) {
      // --- 3. NETWORK ERROR ---
      showError('Can not connect to server: ' + error.message);
    }
  };

  return (
    <form className="form-section" onSubmit={handleSubmit}>
      {/* ... (Rest of the form JSX remains the same) */}
      <h1>Login</h1>
      <div className="input-group">
        <div className="input-row">
          <div className="icon-circle"><BsPersonFill size={25} color="#1a1a1b" /></div>
          <input
            type="text"
            placeholder="Username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="input-group">
        <div className="input-row">
          <div className="icon-circle"><FaKey size={20} color="#1a1a1b" /></div>
          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      <button type="submit" className="register-btn">Login</button>
    </form>
  );
};

export default LoginForm;