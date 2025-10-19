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
      // console.log('Respuesta del backend en el LOGIN:', result);
      if (response.ok) {
        showSuccess(`¡Successfully logged in, Welcome ${username}!`);
        localStorage.setItem('accessToken', result.access_token);
        if (result.user && result.user.channel && result.user.channel.channel_id) {
          localStorage.setItem('channelId', result.user.channel.channel_id);
          localStorage.setItem('username', result.user.username);
          localStorage.setItem('userId', result.user.user_id);
          navigate('/');
        } else {
          // console.error('La respuesta del login no contiene \'user.channel.channel_id\'.');
          showError('Login successful, but there was an issue retrieving your channel data.');
        }
      } else {
        const errorMessage = result.message || 'Unknown error';
        showError('Login failed, ' + errorMessage);
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
      </div>
      <button type="submit" className="register-btn">Login</button>
    </form>
  );
};

export default LoginForm;