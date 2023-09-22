//import logo from './logo.svg';
import "./App.css";
import Home from "./components/pages/Home";
import Dashboard from "./components/pages/Dashboard";
import Admin from "./components/pages/Admin";
import React, { useState, useEffect } from "react";
import LoginSignupForm from "./components/pages/LoginSignup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/elements/NavBar";
import Loading from "./components/elements/Loading";
import { useCurrentUserQuery } from "./apollo/queries/currentUser";
import { withApollo } from "@apollo/client/react/hoc";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const App = ({ client }) => {
  const [loggedIn, setLoggedIn] = useState(!!Cookies.get("jwt"));
  const { error, loading, refetch } = useCurrentUserQuery();

  const [nodeId, setNodeId] = useState("");
  const [pathSegments, setPathSegments] = useState([]);
  const [checkDirectory, setCheckDirectory] = useState(false);
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState("");
  const navigate = useNavigate();

  const resetStates = () => {
    setNodeId("");
    setPathSegments([]);
    setCheckDirectory(false);
    setLoadingNotification(false);
    setLoadingFiles(false);
  };

  const handleLogin = async (status) => {
    try {
      await refetch();
      resetStates();
      navigate("/");
      setLoggedIn(status);
    } catch {
      setLoggedIn(status);
    }
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

  if (loading) return <Loading />;

  function loadFiles() {
    setLoadingNotification(true);
    setLoadingFiles(true);
    setCheckDirectory(true);
  }

  const commonProps = {
    setNodeId,
    pathSegments,
    setPathSegments,
    selectedDirectory,
    setSelectedDirectory,
    loadFiles,
  };

  return (
    <div>
      {loggedIn && (
        <div>
          <NavBar
            changeLoginState={handleLogin}
            client={client}
            {...commonProps}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  nodeId={nodeId}
                  selectedDirectory={selectedDirectory}
                  loadingFiles={loadingFiles}
                  setLoadingFiles={setLoadingFiles}
                  loadingNotification={loadingNotification}
                  setLoadingNotification={setLoadingNotification}
                  checkDirectory={checkDirectory}
                  setCheckDirectory={setCheckDirectory}
                  {...commonProps}
                />
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      )}
      {!loggedIn && <LoginSignupForm changeLoginState={handleLogin} />}
      {!loggedIn && error && <div>{error.message}</div>}
    </div>
  );
};

export default withApollo(App);
