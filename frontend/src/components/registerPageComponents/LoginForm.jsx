import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonFill } from "react-icons/bs";
import { FaKey } from "react-icons/fa";
import { useToast } from '../../hooks/useToast.jsx';
import { useModal } from '../common/Modal/ModalContext';

const LoginForm = ({ togglePanel }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  //FeedbackToast
  const { showSuccess, showError } = useToast()

  const { openModal, closeModal } = useModal();

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
        showSuccess(`Successfully logged in, Welcome ${username}!`);
        localStorage.setItem('accessToken', result.access_token);

        // Save user/channel data
        if (result.user && result.user.channel && result.user.channel.channel_id) {
          localStorage.setItem('channelId', result.user.channel.channel_id);
          localStorage.setItem('username', result.user.username);

          // Aseguramos que guardamos el user_id
          localStorage.setItem('userId', result.user.user_id);

          navigate('/');
          window.location.reload();
        } else {
          showError('Login successful, but there was an issue retrieving your channel data.')
          // console.log("Login result:", result);
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
      showError('Can not connect to server: ' + error.message);
    }
  };

  return (
    <form className="form-section" onSubmit={handleSubmit}>
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
        <button type="button" onClick={() => openModal("reset-password")}>
          I forgot my password
        </button>

      </div>
      <button type="submit" className="register-btn">Login</button>
      {/* Puedes añadir aquí el botón para togglePanel si es necesario */}
    </form>
  );
};

export default LoginForm;