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
import TreeItem from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// import { GET_DIRECTORIES, GET_FILES } from "../../../apollo/queries";
import { GET_DIRECTORIES } from "../../../apollo/queries/getDirectories";
import { GET_FILES } from "../../../apollo/queries/getFiles";
import { Grid, Button, Stack } from "@mui/material";

//Depends on drawerWidth in the NavBar component. TODO: Make it global later
const drawerWidth = 240;

export default function PermanentDrawerLeft() {
  const [directories, setDirectories] = useState();
  const [path, setPath] = useState(null);
  const [selectedDirectory, setSelectedDirectory] = useState("");
  const [nodeId, setNodeId] = useState();
  const [nodeIds, setNodeIds] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState();
  const [contextMenu, setContextMenu] = useState(null);

  const [notification, setShowNotification] = useState(true);
  const [expanded, setExpanded] = useState(["root"]);

  const { dataDirectories, loadingDirectories, errorDirectories } = useQuery(
    GET_DIRECTORIES,
    {
      onCompleted: (completedData) => {
        // console.log("completedData: ", completedData);
        setDirectories(completedData.directories.children);
      },
    }
  );

  const {
    dataFiles,
    loadingFiles,
    errorFiles,
    refetch: refetchFiles,
  } = useQuery(GET_FILES, {
    variables: { directory: selectedDirectory },
    onCompleted: (completedData) => {
      if (completedData.getFiles) {
        setSelectedFiles(completedData.getFiles);
      }
    },
  });

  // Use a useEffect to refetch data when selectedDirectory changes
  useEffect(() => {
    // console.log("selectedDirectory: ", selectedDirectory);
    if (selectedDirectory) {
      setShowNotification(false);

      // Check the string does not contain '\\'. It will NOT be subfolders
      // Check it has not been accepted yet
      if (selectedDirectory.indexOf("\\") === -1 && !nodeIds.includes(nodeId)) {
        setShowNotification(true);
      } else {
        setNodeIds([...nodeIds, nodeId]);
      }

      // Refetch the dataFiles whenever selectedDirectory changes
      refetchFiles().then((result) => {
        if (result.data) {
          setSelectedFiles(result.data.getFiles);
        }
      });
    }
  }, [selectedDirectory, refetchFiles]);

  useEffect(() => {
    setExpanded(nodeIds);
  }, [nodeIds]);

  if (loadingDirectories || loadingFiles) return "Loading...";
  if (errorDirectories || errorFiles) {
    // Handle any errors that occurred during the query
    console.error(errorDirectories, errorFiles);
    return (
      <div>
        {errorDirectories.message}, {errorFiles.message}
      </div>
    );
  }

  const handleContextMenu = (event) => {
    event.preventDefault();
    // console.log("event1: ", event.target.parentElement.dataset.id);
    // console.log("event2: ", event.target.parentElement.parentElement.dataset.id);

    //To close the menu by clicking right button if it is alreayd open
    if (contextMenu) {
      handleClose();
    }

    const elementPath = event.target.parentElement.dataset.id;
    const parentPath = event.target.parentElement.parentElement.dataset.id;

    if (elementPath || parentPath) {
      if (elementPath) {
        setPath(elementPath);
      } else if (parentPath) {
        setPath(parentPath);
      } else {
        console.log("Error: No path!");
      }

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
    } else {
      console.log("No path!");
    }
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  async function handleDownload(e) {
    // console.log("path to download: ", path)
    if (path) {
      try {
        const response = await fetch("http://localhost:3001/download", {
          method: "POST", // Use the POST method
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pathToFile: path }), // Pass the file path in the request body
        });
        if (!response.ok) {
          throw new Error("Failed to download file");
        }

        // console.log('response:', response.headers.get('File-Name'));

        // Get a file name from a selected path
        const delimiter = "\\"; // Delimiter used to split the string
        const lastDelimiterIndex = path.lastIndexOf(delimiter);
        let fileName;
        if (lastDelimiterIndex !== -1) {
          fileName = path.substring(lastDelimiterIndex + 1);
          console.log("fileName", fileName);
        } else {
          console.log("Delimiter not found in the string");
        }

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

  function handleClick(path, nodeId) {
    setSelectedDirectory(path);
    setNodeId(nodeId);
  }

  function acceptNotification() {
    setShowNotification(false);
    setNodeIds([...nodeIds, nodeId]);
  }

  function declineNotification() {
    setSelectedFiles(false);
  }

  //TODO: Check if it is possible to get rid of "node.path". After moving the root directory to the DB, it seems that "node.path" is equal to "node.name".
  const renderItem = (parentName, node) => {
    // console.log("parentName: ", parentName);
    // console.log("Type: ", node);
    // console.log("parentName: ", parentName + " + node.path: " + node.path);
    // console.log("node.name: ", node);
    return (
      <TreeItem
        onClick={() =>
          handleClick(
            parentName !== null ? parentName + "\\\\" + node.path : node.path,
            parentName !== null ? parentName + node.path : node.path
          )
        }
        key={node.name}
        nodeId={parentName !== null ? parentName + node.path : node.path}
        label={node.name}
      >
        {Array.isArray(node.children)
          ? node.children
              .filter((child) => child.type === "directory")
              .map((child) => renderItem(node.name, child))
          : null}
      </TreeItem>
    );
  };

  //To exclude the root folder
  const renderTree = (nodes) =>
    Array.isArray(nodes)
      ? nodes
          .filter((node) => node.type === "directory")
          .map((node) => renderItem(null, node))
      : null;
  // console.log("styles:", styles);
  return (
    <Box sx={{ display: "flex" }}>
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
          <TreeView
            sx={{ height: 110, flexGrow: 1, maxWidth: 400 }}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            // Use the expanded state
            expanded={expanded}
          >
            {renderTree(directories)}
          </TreeView>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default" }}>
        <Toolbar />
        <div style={{ height: 400, width: "100%" }}>
          {selectedFiles ? (
            notification ? (
              <div>
                <Grid
                  container
                  justifyContent="center"
                  alignItems="center"
                  direction="column"
                >
                  Do you agree?
                  <Stack direction="row" spacing={2}>
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
            ) : (
              <div
                onContextMenu={handleContextMenu}
                style={{ cursor: "context-menu" }}
              >
                <DataGrid
                  getRowId={(row) => row.path}
                  columns={[
                    { field: "name", headerName: "Name" },
                    { field: "size", headerName: "Size" },
                    { field: "ctime", headerName: "Date" },
                  ]}
                  rows={selectedFiles}
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
            )
          ) : (
            <div>Select a folder</div>
          )}
        </div>
      </Box>
    </Box>
  );
}
