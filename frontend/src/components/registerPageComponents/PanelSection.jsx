import React from 'react';
import { Link } from 'react-router-dom';

const PanelSection = ({ title, message, buttonText, onClick }) => (
  <div className="panel-section">
    <Link to={"/"} ><h1>{title}</h1> </Link>
    <p>{message}</p>
    <button type="button" className="register-btn outlined" onClick={onClick}>
      {buttonText}
    </button>
  </div>
);

export default PanelSection;