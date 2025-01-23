import "react-quill/dist/quill.snow.css";
import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { GET_DIRECTORIES } from "../../../apollo/queries/getDirectories";
import { GET_NOTIFICATION } from "../../../apollo/queries/getNotification";
import { GET_FILES } from "../../../apollo/queries/getFiles";
import TreeViewDirectories from "../../elements/TreeViewDirectories";
import DataGridFiles from "../../elements/DataGridFiles";
import Notification from "../../elements/Notification";
import Loading from "../../elements/Loading";

const drawerWidth = 240;

export default function PermanentDrawerLeft({
  nodeId,
  setNodeId,
  pathSegments,
  setPathSegments,
  selectedDirectory,
  setSelectedDirectory,
  loadingNotification,
  setLoadingNotification,
  loadingFiles,
  setLoadingFiles,
  checkDirectory,
  setCheckDirectory,
  loadFiles, //test
}) {
  const [directories, setDirectories] = useState();
  const [nodeIds, setNodeIds] = useState([]);
  const [fileName, setFileName] = useState();
  const [selectedFiles, setSelectedFiles] = useState();
  const [contextMenu, setContextMenu] = useState(null);
  const [notification, setNotification] = useState(null);
  const [expanded, setExpanded] = useState(["root"]);

  const handlePathChange = (path) => {
    const parts = path?.split("\\");
    setPathSegments(parts);
  };

  const { error: errorGetDirectories } = useQuery(GET_DIRECTORIES, {
    onCompleted: (completedData) => {
      setDirectories(completedData.directories.children);
    },
  });

  if (errorGetDirectories) {
    console.error("Error:", errorGetDirectories);
  }

  const { error: errorFetchFiles, refetch: refetchFiles } = useQuery(
    GET_FILES,
    {
      variables: { directory: selectedDirectory },
      onCompleted: (completedData) => {
        if (completedData.files) {
          setSelectedFiles(completedData.files.children);
        }
      },
    }
  );

  if (errorFetchFiles) {
    console.error("Error:", errorFetchFiles);
  }

  const { error: errorFetchNotification, refetch: refetchNotification } =
    useQuery(GET_NOTIFICATION, {
      variables: { directory: selectedDirectory },
      onCompleted: (completedData) => {
        setNotification(completedData.getNotifications?.value);
      },
    });

  if (errorFetchNotification) {
    console.error("Error:", errorFetchNotification);
  }

  useEffect(() => {
    setExpanded(nodeIds);
  }, [nodeIds]);

  useEffect(() => {
    async function fetchNotification() {
      try {
        const result = await refetchNotification();
        if (result?.data?.getNotification) {
          setNotification(result.data.getNotification?.value);
        } else {
          setNodeIds((prevNodeIds) => [...prevNodeIds, nodeId]);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoadingNotification(false);
      }
    }

    async function fetchFiles() {
      try {
        const result = await refetchFiles();
        if (result?.data) {
          setSelectedFiles(result.data.files?.children);
          handlePathChange(result.data.files?.relativePath);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoadingFiles(false);
      }
    }

    if (selectedDirectory.indexOf("\\") === -1 && !nodeIds.includes(nodeId)) {
      fetchNotification();
      fetchFiles();
    } else {
      if (!nodeIds.includes(nodeId)) {
        setNodeIds((prevNodeIds) => [...prevNodeIds, nodeId]);
      }
      fetchFiles();
      setLoadingNotification(false);
    }
    setCheckDirectory(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkDirectory]);

  function handleContextMenu(event) {
    event.preventDefault();

    //To close the menu by clicking right button if it is alreayd open
    if (contextMenu) {
      handleCloseMenu();
    }

    const element = event.target.parentElement.dataset.id;
    const parent = event.target.parentElement.parentElement.dataset.id;

    let fileName = null;

    if (element || parent) {
      if (element) {
        fileName = element;
      } else if (parent) {
        fileName = parent;
      } else {
        console.error("Error: No name selected!");
      }

      if (fileName) {
        const fileNameArr = fileName.split("|");
        const name = fileNameArr[0];
        const type = fileNameArr[1];

        if (type === "file") {
          setFileName(name);
          setContextMenu(
            contextMenu === null
              ? {
                  mouseX: event.clientX + 2,
                  mouseY: event.clientY - 6,
                }
              : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                // Other native context menus might behave different.
                // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null
          );
        } else if (type === "directory") {
          return null;
        } else {
          console.log("Type is not udentified");
        }
      }
    } else {
      console.log("No name!");
    }
  }

  const handleCloseMenu = () => {
    setContextMenu(null);
  };

  async function handleDownloadFile() {
    if (fileName) {
      const formattedPath = pathSegments.join("\\") + "\\" + fileName;

      try {
        const response = await fetch("http://localhost:3001/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pathToFile: formattedPath }),
        });
        if (!response.ok) {
          throw new Error("Failed to download file");
        }
        // console.log("response:", response.headers.get("File-Name"));

        // Trigger the file download using the Blob and anchor approach
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();

        console.log("File downloaded successfully");
        handleCloseMenu();
      } catch (error) {
        console.error("Error downloading file:", error.message);
      }
    } else handleCloseMenu();
  }

  function handleTreeClick(relativePath) {
    setNodeId(relativePath);
    setSelectedDirectory(relativePath);
    loadFiles();
  }

  async function handleRowClick(typename, relativePath) {
    if (typename === "directory") {
      setNodeId(relativePath);
      setSelectedDirectory(relativePath);
      loadFiles();
    } else if (typename === "file") {
      try {
        const response = await fetch("http://localhost:3001/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pathToFile: relativePath }),
        });
        if (!response.ok) {
          throw new Error("Failed to open file in browser");
        }

        const blobResponse = await response.blob();
        const contentType = response.headers.get("content-type");
        const blob = new Blob([blobResponse], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);

        if (contentType && contentType.startsWith("text/")) {
          window.open(blobUrl, "_blank");
          console.log("File opened in a new browser tab");
          handleCloseMenu();
        } else {
          const delimiter = "\\";
          const lastDelimiterIndex = relativePath.lastIndexOf(delimiter);
          let fileName;
          if (lastDelimiterIndex !== -1) {
            fileName = relativePath.substring(lastDelimiterIndex + 1);
            console.log("fileName", fileName);
          } else {
            console.error("Delimiter not found in the string");
          }
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = fileName;

          document.body.appendChild(a);
          a.click();
          a.remove();
          console.log("File downloaded successfully");
        }

        handleCloseMenu();
      } catch (error) {
        console.error("Error opening file in browser:", error.message);
      }
    } else {
      console.error("Typename is unexpected. Typename: ", typename);
    }
  }

  function acceptNotification() {
    setNotification(false);
    setNodeIds([...nodeIds, nodeId]);
  }

  function declineNotification() {
    setPathSegments([]);
    setNodeId("");
    setSelectedDirectory("");
    loadFiles();
  }

  return (
    <Box sx={{ display: "flex", position: "sticky" }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          <TreeViewDirectories
            expanded={expanded}
            selected={nodeId}
            directories={directories}
            handleClick={handleTreeClick}
          />
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default" }}>
        <div style={{ height: 400, width: "100%" }}>
          {loadingNotification ? (
            <Loading />
          ) : notification ? (
            <Notification
              notification={notification}
              acceptNotification={acceptNotification}
              declineNotification={declineNotification}
            />
          ) : loadingFiles ? (
            <Loading />
          ) : selectedFiles ? (
            <div
              onContextMenu={(event) => handleContextMenu(event)}
              style={{ cursor: "context-menu" }}
            >
              <DataGridFiles
                selectedFiles={selectedFiles}
                handleRowClick={handleRowClick}
              />
              <Menu
                open={contextMenu !== null}
                onClose={handleCloseMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                  contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
                }
              >
                <MenuItem onClick={handleDownloadFile}>Download</MenuItem>
              </Menu>
            </div>
          ) : (
            <Loading />
          )}
        </div>
      </Box>
    </Box>
  );
}
