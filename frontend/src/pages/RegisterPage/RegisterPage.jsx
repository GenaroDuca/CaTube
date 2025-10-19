import React, { useState } from 'react';
import Header from '../../components/common/header/Header';
import AuthPanel from '../../components/registerPageComponents/AuthPanel';
import './RegisterPage.css';

const RegisterPage = () => {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const togglePanel = () => setIsLoginActive(!isLoginActive);

  return (
    <>
      <Header />
      <AuthPanel isLogin={isLoginActive} togglePanel={togglePanel} />
    </>
  );
};



export default RegisterPage;
