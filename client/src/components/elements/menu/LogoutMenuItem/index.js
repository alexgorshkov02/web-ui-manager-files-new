import React from "react";
import { withApollo } from "@apollo/client/react/hoc";
import MenuItem from "@mui/material/MenuItem";
import Cookies from "js-cookie";

const LogoutMenuItem = ({ changeLoginState, client }) => {
  const logout = () => {
    Cookies.remove("jwt");
    changeLoginState(false);
    client.stop();
    client.resetStore();
  };

  return <MenuItem onClick={logout}>Logout</MenuItem>;
};

export default withApollo(LogoutMenuItem);
