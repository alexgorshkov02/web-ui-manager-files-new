//import logo from './logo.svg';
import { useApolloClient } from "@apollo/client";
import "./App.css";
import Home from "./components/pages/Home";
import Dashboard from "./components/pages/Dashboard";
import Admin from "./components/pages/Admin";
import Profile from "./components/pages/Profile";
import React, { useState, useEffect } from "react";
import LoginSignupForm from "./components/pages/LoginSignup";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/elements/NavBar";
import Loading from "./components/elements/Loading";
import { useCurrentUserQuery } from "./apollo/queries/currentUser";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RerouteToHomePage from "./components/RerouteToHomePage";

const App = () => {
  const client = useApolloClient();

  const [loggedIn, setLoggedIn] = useState(!!Cookies.get("jwt"));
  const { error, loading, refetch } = useCurrentUserQuery({
    skip: !loggedIn, // only run query if logged in
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log(
        "currentUser query completed from App.js: ",
        data ?? {}
      );
    },
  });
  const [user, setUser] = useState(null);

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
      const result = await refetch();
      if (result) {
        // console.log("UserSet: ", result.data?.currentUser);
        setUser(result.data?.currentUser);
      }
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

  //For ProtectedRoute if a page is reloaded
  useEffect(() => {
    if (loggedIn) {
      async function fetchCurrentUser() {
        try {
          const result = await refetch();
          if (result) {
            setUser(result.data?.currentUser);
          } else {
            Cookies.remove("jwt");
            setLoggedIn(false);
          }
        } catch (error) {
          console.error("Error fetching the current user: ", error);
        }
      }
      fetchCurrentUser();
    }
  }, [loggedIn, refetch]);

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
    setSelectedDirectory,
    setLoadingNotification,
    loadFiles,
  };

  return (
    <div>
      {loggedIn && (
        <div>
          <NavBar
            changeLoginState={handleLogin}
            client={client}
            user={user}
            {...commonProps}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  nodeId={nodeId}
                  selectedDirectory={selectedDirectory}
                  loadingNotification={loadingNotification}
                  loadingFiles={loadingFiles}
                  setLoadingFiles={setLoadingFiles}
                  checkDirectory={checkDirectory}
                  setCheckDirectory={setCheckDirectory}
                  {...commonProps}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user} requireAdmin>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user} requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <RerouteToHomePage user={user}>
                  <LoginSignupForm />
                </RerouteToHomePage>
              }
            />
            <Route
              path="/signup"
              element={
                <RerouteToHomePage user={user}>
                  <LoginSignupForm />
                </RerouteToHomePage>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}

      {!loggedIn && <LoginSignupForm changeLoginState={handleLogin} />}
      {!loggedIn && error && <div>{error.message}</div>}
    </div>
  );
};

export default App;
