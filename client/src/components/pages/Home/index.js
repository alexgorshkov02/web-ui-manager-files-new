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
  };

  const handleClose = () => {
    setContextMenu(null);
  };

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
                    <MenuItem onClick={handleClose}>Download</MenuItem>
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
