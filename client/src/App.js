//import logo from './logo.svg';
import "./App.css";
import Home from "./components/pages/Home";
import Dashboard from "./components/pages/Dashboard";
import Admin from "./components/pages/Admin";
import React, { useState } from "react";
import LoginSignupForm from "./components/pages/LoginSignup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./elements/NavBar";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("jwt"));
  // console.log("loggedIn", loggedIn);

  return (
    <div>
      {loggedIn && (
        <div>
          <Router>
            <NavBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Router>
        </div>
      )}
      {!loggedIn && <LoginSignupForm changeLoginState={setLoggedIn} />}
    </div>
  );
}
