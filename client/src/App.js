//import logo from './logo.svg';
import "./App.css";
import Home from "./components/pages/Home";
import Dashboard from "./components/pages/Dashboard";
import Admin from "./components/pages/Admin";
import React, { useState, useEffect } from "react";
import LoginSignupForm from "./components/pages/LoginSignup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/elements/NavBar";
import { useCurrentUserQuery } from "./apollo/queries/currentUser";
import { withApollo } from "@apollo/client/react/hoc";
import CircularProgress from "@mui/material/CircularProgress";

const App = ({ client }) => {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("jwt"));
  const { error, loading, refetch } = useCurrentUserQuery();
  // console.log("loggedIn", loggedIn);

  const handleLogin = (status) => {
    refetch()
      .then(() => {
        // console.log("status: ", status);
        setLoggedIn(status);
      })
      .catch(() => {
        setLoggedIn(status);
      });
  };

  useEffect(() => {
    const unsubscribe = client.onClearStore(() => {
      if (loggedIn) {
        setLoggedIn(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [client, loggedIn]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </div>
    );

  return (
    <div>
      {loggedIn && (
        <div>
          <Router>
            <NavBar changeLoginState={handleLogin} client={client} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Router>
        </div>
      )}
      {!loggedIn && <LoginSignupForm changeLoginState={handleLogin} />}
      {!loggedIn && error && <div>{error.message}</div>}
    </div>
  );
};

export default withApollo(App);
