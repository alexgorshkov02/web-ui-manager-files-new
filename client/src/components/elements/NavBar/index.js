import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuListElement from "../menu/MenuListElement";
import { useNavigate, useLocation } from "react-router-dom";
import { common } from "@mui/material/colors";
import { styled } from "@mui/material/styles";

const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: "bold",
  backgroundColor: common.white,
  "&:hover": {
    backgroundColor: common.white,
  },
  marginRight: "20px",
}));

export default function NavBar({ changeLoginState, client }) {
  const location = useLocation();
  let position = "sticky";
  let drawerWidth = 0;
  if (location.pathname === "/") {
    position = "fixed";
    drawerWidth = 240;
  }

  const navigate = useNavigate();
  const handleHomePageClick = () => {
    navigate("/");
  };
  const handleDashboardPageClick = () => {
    navigate("/dashboard");
  };
  const handleAdminPageClick = () => {
    navigate("/admin");
  };
  const showFilesButton = location.pathname !== "/";
  const showDashboardButton = location.pathname !== "/dashboard";
  const showAdminButton = location.pathname !== "/admin";

  // console.log("position: ", position);
  // console.log("drawerWidth: ", drawerWidth);
  return (
    <AppBar
      position={position}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
        {showFilesButton && (
        <ColorButton
            variant="contained"
            size="large"
            onClick={handleHomePageClick}
          >
            Files
          </ColorButton>
          )}
          {showDashboardButton && (
          <ColorButton
            variant="contained"
            size="large"
            onClick={handleDashboardPageClick}
          >
            Dashboard
          </ColorButton>
          )}
          {showAdminButton && (
          <ColorButton
            variant="contained"
            size="large"
            onClick={handleAdminPageClick}
          >
            Admin
          </ColorButton>
          )}
        </Typography>
      </Toolbar>
      <MenuListElement changeLoginState={changeLoginState} client = {client}/>
    </AppBar>
  );
}
