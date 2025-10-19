import React from 'react';
import PanelSection from './PanelSection';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';


const AuthPanel = ({ isLogin, togglePanel }) => (
  <aside className="auth-panel active">
    <div className={isLogin ? 'auth-box-login' : 'auth-box-signup'}>
      {isLogin ? (
        <>
          <LoginForm togglePanel={togglePanel} />
          <PanelSection
            title="CaTube"
            message="Don't have an account?"
            buttonText="Sign Up"
            onClick={togglePanel}
          />
        </>
      ) : (
        <>
          <PanelSection
            title="CaTube"
            message="Already have an account?"
            buttonText="Login"
            onClick={togglePanel}
          />
          <SignupForm togglePanel={togglePanel} />
        </>
      )}
    </div>
  </aside>
);

export default AuthPanel;