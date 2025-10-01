import React from 'react';
import '../../../styles/RegisterPage.css';

const PanelSection = ({ title, message, buttonText, onClick }) => (
  <div className="panel-section">
    <a href="../index.html"><h1>{title}</h1></a>
    <p>{message}</p>
    <button type="button" className="register-btn outlined" onClick={onClick}>
      {buttonText}
    </button>
  </div>
);

export default PanelSection;