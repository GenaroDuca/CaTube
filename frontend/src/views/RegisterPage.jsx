import React, { useState } from 'react';
import Header from './components/header/Header';
import AuthPanel from './components/register/AuthPanel';

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