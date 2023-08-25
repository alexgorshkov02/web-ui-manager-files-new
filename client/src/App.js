//import logo from './logo.svg';
import "./App.css";
import Home from "./components/pages/Home";
import React, { useState } from "react";
import LoginSignupForm from "./components/pages/LoginSignup"

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("jwt"));
  // console.log("loggedIn", loggedIn);
  return (
    <div>
      {loggedIn && (
        <div>
          <Home />
        </div>
      )}
      {!loggedIn && <LoginSignupForm changeLoginState={setLoggedIn} />}
    </div>
  );
}