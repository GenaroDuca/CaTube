import React from 'react';
import { Link } from 'react-router-dom';

const SuccessPage = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <img style= {{ width: "100px", marginTop: "-10px"}} src= "../../../public/catube_white.png"  alt="CaTube Logo" />
      <h1>Email Verified Successfully!</h1>
      <h2 style={{color: '#90b484'}}>Thank you for being part of the CaTube family</h2>
      <p >Your account is now active. You can log in and start using our application.</p>
      
      {/* Action button to guide the user */}
      <Link to="/register">
        <button style={{ 
          padding: '20px 40px', 
          backgroundColor: '#90b484', // Green color for success
          border: 'none', 
          borderRadius: '30px',
          cursor: 'pointer',
          marginTop: "30px"
        }}>
          Go to Login
        </button>
      </Link>
    </div>
  );
};

export default SuccessPage;