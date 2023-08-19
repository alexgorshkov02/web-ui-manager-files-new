//import logo from './logo.svg';
import "./App.css";
import Home from "./components/pages/Home";
import LoginForm from "./components/pages/Login";
import React, { useState } from "react";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("jwt"));
  // console.log("loggedIn", loggedIn);
  return (
    <div>
      {" "}
      {loggedIn && (
        <div>
          <Home />
        </div>
      )}
      {!loggedIn && <LoginForm changeLoginState={setLoggedIn} />}
    </div>
  );
}