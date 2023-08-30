import React from "react";
import { withApollo } from "@apollo/client/react/hoc";
import MenuItem from "@mui/material/MenuItem";

const LogoutMenuItem = ({ changeLoginState, client }) => {
  const logout = () => {
    localStorage.removeItem("jwk");
    changeLoginState(false);
    client.stop();
    client.resetStore();
  };

  return <MenuItem onClick={logout}>Logout</MenuItem>;
};

export default withApollo(LogoutMenuItem);
