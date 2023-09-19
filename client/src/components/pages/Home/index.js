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
import CircularProgress from "@mui/material/CircularProgress";
// import { GET_DIRECTORIES, GET_FILES } from "../../../apollo/queries";
import { GET_DIRECTORIES } from "../../../apollo/queries/getDirectories";
import { GET_NOTIFICATION } from "../../../apollo/queries/getNotification";
import { GET_FILES } from "../../../apollo/queries/getFiles";
import { Grid, Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import "react-quill/dist/quill.snow.css";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";

//Depends on drawerWidth in the NavBar component. TODO: Make it global later
const drawerWidth = 240;

function Breadcrumb({ pathSegments, onClick, onHomeClick }) {
  return (
    <div>
      <span onClick={onHomeClick} style={{ cursor: "pointer" }}>
        {pathSegments.length === 0 ? "Home" : "Home\\"}
      </span>
      {pathSegments.map((segment, index) => (
        <span key={index} onClick={onClick} style={{ cursor: "pointer" }}>
          {segment}
          {index < pathSegments.length - 1 && <span>{"\\"}</span>}
        </span>
      ))}
    </div>
  );
}

export default function PermanentDrawerLeft() {
  const [selectedDirectory, setSelectedDirectory] = useState("");
  const [directories, setDirectories] = useState();
  const [nodeId, setNodeId] = useState();
  const [nodeIds, setNodeIds] = useState([]);
  const [fileName, setFileName] = useState();

  const [pathSegments, setPathSegments] = useState([]);
  const handlePathChange = (path) => {
    console.log("path: ", path);
    const parts = path?.split("\\");
    console.log("parts: ", parts);
    setPathSegments(parts);
    console.log("path: ", { path });
  };

  const [selectedFiles, setSelectedFiles] = useState();
  const [contextMenu, setContextMenu] = useState(null);
  const [notification, setNotification] = useState();
  const [expanded, setExpanded] = useState(["root"]);
  const [loading, setLoading] = useState(false);
  const sanitizeHTML = (html) => {
    return { __html: html };
  };

  const [infoMessage, setInfoMessage] = useState(false);
  const [infoMessageValue, setInfoMessageValue] = useState(false);

  useQuery(GET_DIRECTORIES, {
    onCompleted: (completedData) => {
      console.log(
        "completedData.directories.children: ",
        completedData.directories
      );
      setDirectories(completedData.directories.children);
    },
  });

  const {
    // dataFiles,
    // loadingFiles,
    // errorFiles,
    refetch: refetchFiles,
  } = useQuery(GET_FILES, {
    variables: { directory: selectedDirectory },
    onCompleted: (completedData) => {
      if (completedData.files) {
        console.log("completedData.files ", completedData.files.name);
        setSelectedFiles(completedData.files.children);
      }
    },
  });

  const {
    // dataNotification,
    // loadingNotification,
    // errorNotification,
    refetch: refetchNotification,
  } = useQuery(GET_NOTIFICATION, {
    variables: { directory: selectedDirectory },
    onCompleted: (completedData) => {
      setNotification(completedData.getNotifications?.value);
    },
  });

  useEffect(() => {
    setExpanded(nodeIds);
  }, [nodeIds]);

  useEffect(() => {
    if (infoMessage) {
      setInfoMessage(false);
      setInfoMessageValue("");
    }

    if (selectedDirectory) {
      console.log("selectedDirectory: ", selectedDirectory);

      if (selectedDirectory.indexOf("\\") === -1 && !nodeIds.includes(nodeId)) {
        console.log("selectedDirectory2: ", selectedDirectory);

        refetchNotification()
          .then((result) => {
            if (result.data?.getNotification) {
              setNotification(result.data.getNotification.value);
            } else {
              setNodeIds((prevNodeIds) => [...prevNodeIds, nodeId]);
            }
          })
          .then(() => {
            refetchFiles().then((result) => {
              if (result.data) {
                console.log("result.data: ", result.data);
                setSelectedFiles(result.data.files.children);
                handlePathChange(result.data.files.relativePath);
              }
            });
          })
          .then(() => setLoading(false));
      } else {
        setNodeIds((prevNodeIds) => [...prevNodeIds, nodeId]);
        refetchFiles()
          .then((result) => {
            if (result.data) {
              console.log("result.data: ", result.data);
              setSelectedFiles(result.data.files.children);
              handlePathChange(result.data.files.relativePath);
            }
          })
          .then(() => setLoading(false));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectory]);

  // if (loadingDirectories || loadingFiles) return "Loading...";
  // if (errorDirectories || errorFiles) {
  //   // Handle any errors that occurred during the query
  //   console.error(errorDirectories, errorFiles);
  //   return (
  //     <div>
  //       {errorDirectories.message}, {errorFiles.message}
  //     </div>
  //   );
  // }

  const handleContextMenu = async (event) => {
    event.preventDefault();
    // console.log("event1: ", event.target.parentElement.dataset.id);
    // console.log("event2: ", event.target.parentElement.parentElement.dataset.id);
    console.log("event1: ", event.target.parentElement.dataset.id);
    console.log(
      "event2: ",
      event.target.parentElement.parentElement.dataset.id
    );
    // const itemType = params.row.type;

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
        console.log("Error: No name selected!");
      }

      const fileNameArr = await fileName.split("|");

      const name = fileNameArr[0];
      const type = fileNameArr[1];

      console.log("name: ", name);
      console.log("type: ", type);

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
        console.log("This is directory");
        setInfoMessage(true);
        setInfoMessageValue("Folders cannot be downloaded");
      } else {
        console.log("Type is not udentified");
      }
    } else {
      console.log("No name!");
    }
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  async function handleDownload(e) {
    console.log("e: ", e.target);
    console.log("pathSegments: ", pathSegments);
    console.log("fileName: ", fileName);
    if (pathSegments && fileName) {
      const formattedPath = pathSegments.join("\\") + "\\" + fileName;
      console.log("formattedPath: ", formattedPath);

      try {
        const response = await fetch("http://localhost:3001/download", {
          method: "POST", // Use the POST method
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pathToFile: formattedPath }), // Pass the file path in the request body
        });
        if (!response.ok) {
          throw new Error("Failed to download file");
        }
        console.log("response:", response.headers.get("File-Name"));

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

  async function handleClick(relativePath) {
    console.log("nodeId: ", nodeId);
    console.log("relativePath: ", relativePath);
    if (relativePath !== nodeId) {
      setLoading(true);
      setSelectedFiles([]);
      console.log("relativePath: ", relativePath);
      setNodeId(relativePath);
      setSelectedDirectory(relativePath);
    } else {
      setLoading(true);
      setSelectedFiles([]);
      refetchFiles()
        .then((result) => {
          if (result.data) {
            console.log("result.data: ", result.data);
            setSelectedFiles(result.data.files.children);
            handlePathChange(result.data.files.relativePath);
          }
        })
        .then(() => setLoading(false));
    }
  }

  async function handleRowClick(typename, relativePath, name) {
    console.log("relativePath: ", relativePath);
    console.log("name: ", name);
    if (typename === "directory") {
      if (relativePath !== nodeId) {
        setLoading(true);
        setSelectedFiles([]);
        console.log("relativePath: ", relativePath);
        setNodeId(relativePath);
        setSelectedDirectory(relativePath);
      } else {
        setLoading(true);
        setSelectedFiles([]);
        refetchFiles()
          .then((result) => {
            if (result.data) {
              console.log("result.data: ", result.data);
              setSelectedFiles(result.data.files.children);
              handlePathChange(result.data.files.relativePath);
            }
          })
          .then(() => setLoading(false));
      }
    } else if (typename === "file") {
      try {
        const response = await fetch("http://localhost:3001/download", {
          method: "POST", // Use the POST method
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pathToFile: relativePath }), // Pass the file path in the request body
        });
        if (!response.ok) {
          throw new Error("Failed to open file in browser");
        }

        const blobResponse = await response.blob();
        // console.log("response: ", response.blob())
        const contentType = response.headers.get("content-type");
        const blob = new Blob([blobResponse], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);

        if (contentType && contentType.startsWith("text/")) {
          window.open(blobUrl, "_blank");
          console.log("File downloaded successfully");
          handleClose();
        } else {
          console.log("relativePath: ", relativePath);
          const delimiter = "\\"; // Delimiter used to split the string
          const lastDelimiterIndex = relativePath.lastIndexOf(delimiter);
          let fileName;
          if (lastDelimiterIndex !== -1) {
            fileName = relativePath.substring(lastDelimiterIndex + 1);
            console.log("fileName", fileName);
          } else {
            console.log("Delimiter not found in the string");
          }
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = fileName;

          document.body.appendChild(a);
          a.click();
          a.remove();
          console.log("File opened in a new browser tab");
        }

        handleClose();
      } catch (error) {
        console.error("Error opening file in browser:", error.message);
      }
    } else {
      console.log("Typename is unexpected. Typename: ", typename);
    }
  }

  const handleHomeClick = () => {
    setPathSegments([]);
    setNodeId();
    setSelectedDirectory("");
  };

  function handleClickPath(event) {
    console.log("Clicked on breadcrumb segment"); // Add this line
    // Get the text content of the clicked element (span)
    let clickedWord = event.target.textContent;
    console.log("clickedWord:", clickedWord);
    if (clickedWord.endsWith("\\")) {
      clickedWord = clickedWord.slice(0, -1);
    }
    console.log("clickedWord:", clickedWord);
    // Get the index of the clicked word in the pathSegments array
    const index = pathSegments.indexOf(clickedWord);
    console.log("index:", index);
    if (index !== -1) {
      const clickedPath = pathSegments.slice(0, index + 1).join("\\");
      console.log("clickedPath3:", clickedPath);
      // Update the path state with the clicked path
      // setPath(clickedPath);
      setSelectedDirectory(clickedPath);
    }
  }

  function acceptNotification() {
    // setShowNotification(false);
    setNotification(false);
    console.log("nodeId: ", nodeId);
    setNodeIds([...nodeIds, nodeId]);
  }

  function declineNotification() {
    setSelectedDirectory("");
    // setSelectedFiles(false);
    setPathSegments([]);
    setNotification(false);
  }

  const renderItem = (node) => {
    // console.log("parentName: ", parentName);
    // console.log("Type: ", node);
    // console.log("parentName: ", parentName + " + node.path: " + node.path);
    // console.log("node.name: ", node);
    return (
      <TreeItem
        onClick={() => handleClick(node.relativePath)}
        key={node.name}
        nodeId={node.relativePath}
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
        <Toolbar>
          <Breadcrumb
            pathSegments={pathSegments}
            onClick={handleClickPath}
            onHomeClick={handleHomeClick}
          />
        </Toolbar>
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
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </div>
          ) : selectedFiles ? (
            notification ? (
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
            ) : (
              <div>
                {infoMessage && (
                  <Fade
                    in={infoMessage} //Write the needed condition here to make it appear
                    timeout={{ enter: 1000, exit: 4000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
                    addEndListener={() => {
                      setTimeout(() => {
                        setInfoMessage(false);
                        setInfoMessageValue("");
                      }, 5000);
                    }}
                  >
                    <Alert severity="info">{infoMessageValue}</Alert>
                  </Fade>
                )}
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
                      { field: "ctime", headerName: "Date", width: 100 },
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
                    <MenuItem onClick={(e) => handleDownload(e)}>
                      Download
                    </MenuItem>
                  </Menu>
                </div>
              </div>
            )
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </div>
          )}
        </div>
      </Box>
    </Box>
  );
}
