import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuListElement from "../menu/MenuListElement";
import { useNavigate, useLocation } from "react-router-dom";
import { common } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import Breadcrumb from "../../elements/Breadcrumb";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";

const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: "bold",
  backgroundColor: common.white,
  "&:hover": {
    backgroundColor: common.white,
  },
  marginRight: "20px",
}));

export default function NavBar({
  changeLoginState,
  client,
  setNodeId,
  setSelectedDirectory,
  pathSegments,
  setPathSegments,
  loadFiles,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const handleHomePageClick = () => {
    handleHomeClick();
    navigate("/");
  };
  const handleDashboardPageClick = () => {
    navigate("/dashboard");
  };
  const handleAdminPageClick = () => {
    navigate("/admin");
  };
  const homePage = location.pathname === "/";
  const dashboardPage = location.pathname === "/dashboard";
  const adminPage = location.pathname === "/admin";

  function handlePathClick(event) {
    let clickedWord = event.target.textContent;
    if (clickedWord.endsWith("\\")) {
      clickedWord = clickedWord.slice(0, -1);
    }

    const index = pathSegments.indexOf(clickedWord);
    if (index !== -1) {
      const clickedPath = pathSegments.slice(0, index + 1).join("\\");
      setNodeId(clickedPath);
      setSelectedDirectory(clickedPath);
      loadFiles();
    }
  }

  function handleHomeClick() {
    setPathSegments([]);
    setNodeId("");
    setSelectedDirectory("");
    loadFiles();
  }

  function handleRefreshClick() {
    loadFiles();
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        width: `100%`,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Toolbar>
        {homePage && (
          <Breadcrumb
            pathSegments={pathSegments}
            onClick={handlePathClick}
            onHomeClick={handleHomeClick}
          />
        )}
      </Toolbar>

      <Toolbar sx={{ justifyContent: "flex-end" }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            justifyContent: "flex-end",
          }}
        >
          {(dashboardPage || adminPage) && (
            <ColorButton
              variant="contained"
              size="large"
              onClick={handleHomePageClick}
            >
              Files
            </ColorButton>
          )}
          {(homePage || adminPage) && (
            <ColorButton
              variant="contained"
              size="large"
              onClick={handleDashboardPageClick}
            >
              Dashboard
            </ColorButton>
          )}
          {(homePage || dashboardPage) && (
            <ColorButton
              variant="contained"
              size="large"
              onClick={handleAdminPageClick}
            >
              Admin
            </ColorButton>
          )}
          {homePage && (
            <ColorButton
              variant="contained"
              size="large"
              onClick={() => handleRefreshClick()}
            >
              <RefreshIcon />
            </ColorButton>
          )}
        </Typography>
        <MenuListElement changeLoginState={changeLoginState} client={client} />
      </Toolbar>
    </AppBar>
  );
}
