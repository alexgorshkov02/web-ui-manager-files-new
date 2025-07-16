import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../elements/Loading";

const RerouteToHomePage = ({ user, children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // if user is logged in, redirect to home
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (user === null) {
    // still loading user info
    return <Loading />;
  }

  if (!user) {
    // user is NOT logged in - show the login/signup page
    return children;
  }

  // user is logged in and already redirected, render nothing
  return null;
};

export default RerouteToHomePage;
