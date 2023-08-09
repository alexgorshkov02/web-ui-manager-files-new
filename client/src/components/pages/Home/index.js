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


// REST queries
const GET_GRAPHQL_TODOS = gql`
  query getTodos {
    getTodos {
      id
      title
      completed
    }
  }
`;

// const REST_DOWNLOAD_FILE = gql`
// mutation DownloadFile {
//   downloadFile(path: $path)
//     @rest(path: "/download", method: "POST")
// }
// `;




export default function PermanentDrawerLeft() {
  const [actualData, setEvent] = useState();
  const [directories, setDirectories] = useState();
  // const [dataRest1, downloadFile] = useState(null);


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
  // const [downloadFile] = useMutation(REST_DOWNLOAD_FILE, {
  //   client: restClient,
  // });

  // const { dataRest } = useQuery(GET_REST_TODOS, { client: restClient });

  if (loading) return "Loading...";
  if (error) {
    // Handle any errors that occurred during the query
    console.error(error);
    return <div>{error.message}</div>;
  }

  const handleContextMenu = (event) => {
    event.preventDefault();
    console.log("event1: ", event.target.parentElement.dataset.id);
    console.log("event2: ", event.target.parentElement.parentElement.dataset.id);
    let path;

    if (event.target.parentElement.dataset.id) {
      path = event.target.parentElement.dataset.id
    } else if (event.target.parentElement.parentElement.dataset.id) {
      path = event.target.parentElement.parentElement.dataset.id
    } else {
      console.log ("No path!")
    }

    setPath (path);

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

  // const handleDownload = (e) => {
  //   // e.preventDefault();
  //   window.alert('success!');
  // //   const selectedRows = e.gridApi.getSelectedRows();
  // // const selectedId = selectedRows[0].id;
  // console.log("selectedId: ", e);
  //   // downloadFile();
  // }



  const handleDownload = (e) => {
    // console.log('e.type: ', e.type);
    if (e.type === 'click') {
      console.log('Left click');
      console.log('path: ', path);
      handleClose();

    } else if (e.type === 'contextmenu') {
      console.log('Right click');
    }
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
