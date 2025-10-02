import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupForm = ({ togglePanel }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [usernameValid, setUsernameValid] = useState(null);
  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [repeatPasswordValid, setRepeatPasswordValid] = useState(null);

  const validateUsername = (value) => {
    if (value === '') return null;
    const validChars = /^[a-zA-Z0-9_]+$/.test(value);
    return value.length >= 5 && value.length <= 20 && validChars;
  };

  const validateEmail = (value) => {
    if (value === '') return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value) => {
    if (value === '') return null;
    return value.length >= 8;
  };

  const validateRepeatPassword = (value) => {
    if (value === '') return null;
    return value === password;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameValid(validateUsername(value));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(validatePassword(value));
    // Re-validate repeat password
    setRepeatPasswordValid(validateRepeatPassword(repeatPassword));
  };

  const handleRepeatPasswordChange = (e) => {
    const value = e.target.value;
    setRepeatPassword(value);
    setRepeatPasswordValid(validateRepeatPassword(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameValid && emailValid && passwordValid && repeatPasswordValid) {
      const userData = { username, email, password };
      try {
        const response = await fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        const result = await response.json();
        if (response.ok) {
          alert('¡Usuario registrado con éxito! Bienvenido, ' + result.username);
          // Reset form
          setUsername('');
          setEmail('');
          setPassword('');
          setRepeatPassword('');
          setUsernameValid(null);
          setEmailValid(null);
          setPasswordValid(null);
          setRepeatPasswordValid(null);
          togglePanel(); // Go to login
        } else {
          const errorMessage = result.message || 'Ocurrió un error desconocido.';
          if (errorMessage === 'Username already exists') {
            alert('El nombre de usuario ya existe. Por favor, elige otro.');
          } else {
            alert('Error al registrar: ' + JSON.stringify(errorMessage));
          }
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar con el servidor. Por favor, intenta más tarde.');
      }
    } else {
      alert('Por favor, corrige los campos marcados en rojo antes de continuar.');
    }
  };

  const getInputClass = (isValid) => {
    if (isValid === true) return 'input correct-input';
    if (isValid === false) return 'input incorrect-input';
    return 'input';
  };

  return (
    <form className="form-section" onSubmit={handleSubmit}>
      <h1>Sign Up</h1>
      <div className="input-group">
        <div className="input-row">
          <div className="icon-circle"><i className="bi bi-person"></i></div>
          <input
            type="text"
            placeholder="Username"
            className={getInputClass(usernameValid)}
            value={username}
            onChange={handleUsernameChange}
            required
          />
        </div>
      </div>
      <label htmlFor="text">Min 5 characters, max 20 characters</label>

      <div className="input-group">
        <div className="input-row">
          <div className="icon-circle"><i className="bi bi-envelope"></i></div>
          <input
            type="email"
            placeholder="Mail"
            className={getInputClass(emailValid)}
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
      </div>

      <div className="input-group">
        <div className="input-row">
          <div className="icon-circle"><i className="bi bi-key"></i></div>
          <input
            type="password"
            placeholder="Password"
            className={getInputClass(passwordValid)}
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
      </div>
      <label htmlFor="password">Min 8 characters</label>

      <div className="input-group">
        <div className="input-row">
          <div className="icon-circle"><i className="bi bi-key"></i></div>
          <input
            type="password"
            placeholder="Repeat Password"
            className={getInputClass(repeatPasswordValid)}
            value={repeatPassword}
            onChange={handleRepeatPasswordChange}
            required
          />
        </div>
      </div>
      <button type="submit" className="register-btn">Sign Up</button>
    </form>
  );
};

export default SignupForm;
