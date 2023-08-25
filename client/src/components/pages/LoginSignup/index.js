import React, { useState } from "react";
import LoginForm from "../Login";
import SignupForm from "../Signup";

const LoginSignupForm = ({ changeLoginState }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="authModal">
      {showLogin && (
        <div>
          <LoginForm changeLoginState={changeLoginState} />
          <a onClick={() => setShowLogin(false)}>Want to sign up? Click here</a>
        </div>
      )}
      {!showLogin && (
        <div>
          <SignupForm changeLoginState={changeLoginState} />
          <a onClick={() => setShowLogin(true)}>Want to login? Click here</a>
        </div>
      )}
    </div>
  );
};

export default LoginSignupForm;
