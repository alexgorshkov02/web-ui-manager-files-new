import React from "react";
import { useApolloClient } from "@apollo/client";
import MenuItem from "@mui/material/MenuItem";
import Cookies from "js-cookie";

const LogoutMenuItem = ({ changeLoginState }) => {
  const client = useApolloClient();
  const logout = () => {
    Cookies.remove("jwt");
    changeLoginState(false);
    client.stop();
    client.resetStore();
  };

  return <MenuItem onClick={logout}>Logout</MenuItem>;
};

export default LogoutMenuItem;
