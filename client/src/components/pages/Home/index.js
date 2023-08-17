import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import TreeItem from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// import { restClient } from "../../../utils/restClient";

const drawerWidth = 240;

// Define mutation
const GET_FILES = gql`
  mutation GetFiles($directory: String) {
    getFiles(directory: $directory) {
      name
      size
      ctime
      path
    }
  }
`;

// Define query
const GET_DIRECTORIES = gql`
  query GetDirectories {
    directories {
      name
      path
      type
      children {
        name
        path
        type
        children {
          name
          path
          type
          children {
            name
            path
            type
            children {
              name
              path
              type
            }
          }
        }
      }
    }
  }
`;


export default function PermanentDrawerLeft() {
  const [actualData, setEvent] = useState();
  const [directories, setDirectories] = useState();
  const [contextMenu, setContextMenu] = useState(null);
  const [path, setPath] = useState(null);

  const { loading, data, error } = useQuery(GET_DIRECTORIES, {
    onCompleted: (completedData) => {
      // console.log("completedData: ", completedData);
      setDirectories(completedData.directories.children);
    },
  });

  useEffect(() => {
    setDirectories(directories);
  }, [directories]);

  const [getFiles] = useMutation(GET_FILES);

  if (loading) return "Loading...";
  if (error) {
    // Handle any errors that occurred during the query
    console.error(error);
    return <div>{error.message}</div>;
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

  async function handleClick(path) {
    // console.log("path: ", path);
    const response = await getFiles({ variables: { directory: path } });
    const actualData = response.data.getFiles;
    // console.log(actualData);
    setEvent(actualData);
  }

  const renderItem = (node) => {
    // console.log("Type: ", node.type);
    return (
      <TreeItem
        onClick={() => handleClick(node.path)}
        key={node.name}
        nodeId={node.path}
        label={node.name}
      >
        {Array.isArray(node.children)
          ? node.children
              .filter((child) => child.type === "directory")
              .map((child) => renderItem(child))
          : null}
      </TreeItem>
    );
  };

  //To exclude the root folder
  const renderTree = (nodes) =>
    Array.isArray(nodes)
      ? nodes
          .filter((node) => node.type === "directory")
          .map((node) => renderItem(node))
      : null;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Permanent drawer
          </Typography>
        </Toolbar>
      </AppBar>
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
            defaultExpanded={["root"]}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            {renderTree(directories)}
          </TreeView>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default" }}>
        <Toolbar />
        <div style={{ height: 400, width: "100%" }}>
          {(() => {
            if (actualData) {
              return (
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
                    rows={actualData}
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
              );
            } else {
              return <div>Select a folder</div>;
            }
          })()}
        </div>
      </Box>
    </Box>
  );
}
