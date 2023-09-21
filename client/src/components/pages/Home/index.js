import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { GET_DIRECTORIES } from "../../../apollo/queries/getDirectories";
import { GET_NOTIFICATION } from "../../../apollo/queries/getNotification";
import { GET_FILES } from "../../../apollo/queries/getFiles";
import { Grid, Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import "react-quill/dist/quill.snow.css";
import TreeViewDirectories from "../../elements/TreeViewDirectories";
import Loading from "../../elements/Loading";

const drawerWidth = 240;

export default function PermanentDrawerLeft({
  setPathSegments,
  nodeId,
  setNodeId,
  loadingNotification,
  setLoadingNotification,
  checkDirectory,
  setCheckDirectory,
  pathSegments,
}) {
  const [selectedDirectory, setSelectedDirectory] = useState("");
  const [directories, setDirectories] = useState();
  const [nodeIds, setNodeIds] = useState([]);
  const [fileName, setFileName] = useState();
  const [selectedFiles, setSelectedFiles] = useState();
  const [contextMenu, setContextMenu] = useState(null);
  const [notification, setNotification] = useState(null);
  const [expanded, setExpanded] = useState(["root"]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const handlePathChange = (path) => {
    const parts = path?.split("\\");
    setPathSegments(parts);
  };

  const sanitizeHTML = (html) => {
    return { __html: html };
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
      variables: { directory: checkDirectory },
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

    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectory]);

  useEffect(() => {
    async function fetchNotification() {
      try {
        const result = await refetchNotification();
        if (result?.data?.getNotification) {
          setNotification(result.data.getNotification?.value);
        } else {
          setNodeIds((prevNodeIds) => [...prevNodeIds, nodeId]);
        }
        setSelectedDirectory(checkDirectory);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoadingNotification(false);
      }
    }

    if (checkDirectory.indexOf("\\") === -1 && !nodeIds.includes(nodeId)) {
      fetchNotification();
    } else {
      if (!nodeIds.includes(nodeId)) {
        setNodeIds((prevNodeIds) => [...prevNodeIds, nodeId]);
      }
      setLoadingNotification(false);
      setSelectedDirectory(checkDirectory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkDirectory]);

  function handleContextMenu(event) {
    event.preventDefault();
    // console.log("event1: ", event.target.parentElement.dataset.id);
    // console.log("event2: ", event.target.parentElement.parentElement.dataset.id);

    //To close the menu by clicking right button if it is alreayd open
    if (contextMenu) {
      handleClose();
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

  const handleClose = () => {
    setContextMenu(null);
  };

  async function handleDownload() {
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
        handleClose();
      } catch (error) {
        console.error("Error downloading file:", error.message);
      }
    } else handleClose();
  }

  function loadFiles(path) {
    setNodeId(path);
    setLoadingNotification(true);
    setLoadingFiles(true);
    setCheckDirectory(path);
  }

  function handleTreeClick(relativePath) {
    if (nodeId === "" || relativePath !== nodeId) {
      loadFiles(relativePath);
    }
  }

  async function handleRowClick(typename, relativePath, name) {
    if (typename === "directory") {
      if (relativePath !== nodeId) {
        loadFiles(relativePath);
      }
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
          handleClose();
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

        handleClose();
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
    loadFiles("");
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
            <div>
              <Grid container direction="column">
                <Typography
                  variant="body1"
                  style={{ whiteSpace: "pre-wrap", padding: "16px" }}
                >
                  <span
                    className="view ql-editor"
                    dangerouslySetInnerHTML={sanitizeHTML(notification)}
                  />
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    onClick={acceptNotification}
                    variant="contained"
                    color="success"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={declineNotification}
                    variant="contained"
                    color="error"
                  >
                    Decline
                  </Button>
                </Stack>
              </Grid>
            </div>
          ) : loadingFiles ? (
            <Loading />
          ) : selectedFiles ? (
            <div
              onContextMenu={(event) => handleContextMenu(event)}
              style={{ cursor: "context-menu" }}
            >
              <DataGrid
                slotProps={{
                  pagination: {
                    labelRowsPerPage: "Files per page",
                  },
                }}
                getRowId={(row) => row.name + "|" + row.type}
                columns={[
                  { field: "name", headerName: "Name", width: 200 },
                  { field: "size", headerName: "Size", width: 100 },
                  { field: "ctime", headerName: "Date", width: 300 },
                ]}
                rows={selectedFiles}
                onRowClick={(params) => {
                  const typename = params.row.type;
                  const relativePath = params.row.relativePath;
                  const name = params.row.name;
                  handleRowClick(typename, relativePath, name);
                }}
              />

              <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                  contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
                }
              >
                <MenuItem onClick={handleDownload}>Download</MenuItem>
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
