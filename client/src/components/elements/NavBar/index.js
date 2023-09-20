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
  nodeId,
  setNodeId,
  pathSegments,
  setPathSegments,
  setCheckDirectory,
  setLoadingNotification,
  setLoadingFiles,
}) {
  const location = useLocation();
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

  function handlePathClick(event) {
    let clickedWord = event.target.textContent;

    if (clickedWord.endsWith("\\")) {
      clickedWord = clickedWord.slice(0, -1);
    }

    const index = pathSegments.indexOf(clickedWord);

    if (index !== -1 && clickedWord !== nodeId) {
      const clickedPath = pathSegments.slice(0, index + 1).join("\\");
      loadFiles(clickedPath);
    }
  }

  const isHomePage = location.pathname === "/";

  function handleHomeClick() {
    if (nodeId) {
      setPathSegments([]);
      loadFiles("");
    }
  }

  function loadFiles(path) {
    setNodeId(path);
    setLoadingNotification(true);
    setLoadingFiles(true);
    setCheckDirectory(path);
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
        {isHomePage && (
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
        <MenuListElement changeLoginState={changeLoginState} client={client} />
      </Toolbar>
    </AppBar>
  );
}
