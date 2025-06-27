import * as React from "react";
import { useState, useEffect, createRef } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useQuery } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../../../apollo/queries/getNotifications";
import {
  useAddNotification,
  useUpdateNotification,
  useDeleteNotification,
} from "../../../apollo/mutations";
import Fade from "@mui/material/Fade";

//TODO: "<" will be shown  &lt;. Check othe special symbols later

const dialogStyles = {
  maxWidth: "80vw",
  maxHeight: "80vh",
  overflowX: "hidden",
  margin: "auto",
  marginTop: "5vh",
  position: "relative",
};

const resizableHandleStyles = {
  width: "10px",
  height: "10px",
  position: "absolute",
  bottom: "0",
  right: "0",
  cursor: "auto",
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  maxWidth: "auto",
  color: theme.palette.text.primary,
}));

const headerStyle = {
  fontWeight: "bold",
};

// Hover effect
const hoverClass = {
  "&:hover": {
    backgroundColor: "#f0f0f0",
  },
};

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");
  const [customer, setCustomer] = useState("");
  const [directory, setDirectory] = useState("");
  const [disabledDirectory, setDisabledDirectory] = useState(false);
  const [value, setValue] = useState("");
  const handleValueChange = (value) => {
    setValue(value);
  };
  const dialogRef = createRef();
  const [error, setError] = useState(false);
  const [errorDirectory, setErrorDirectory] = useState(false);
  const [errorValue, setErrorValue] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { refetch: refetchNotifications } = useQuery(GET_NOTIFICATIONS, {
    onCompleted: (completedData) => {
      const notifications = completedData?.getNotifications ?? [];
      console.log("Notifications fetched from server:", notifications);

      setNotifications(notifications);
    },
    onError: (error) => {
      console.error("GraphQL error on load:", error);
    },
  });

  const [addNotification] = useAddNotification();
  const [updateNotification] = useUpdateNotification();
  const [deleteNotification] = useDeleteNotification();

  useEffect(() => {
    async function fetchDatahNotifications() {
      try {
        const result = await refetchNotifications();
        console.log("Refetched notifications:", result?.data?.getNotifications);

        if (result?.data) setNotifications(result.data.getNotifications);
      } catch (error) {
        console.error("Error while refetching notifications:", error);
      }
    }

    if (!open) {
      fetchDatahNotifications();
      setId("");
      setCustomer("");
      setDirectory("");
      setValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCloseClick = () => {
    setError(false);
    setOpen(false);
  };

  const handleAddNotificationClick = () => {
    setDisabledDirectory(false);
    setOpen(true);
  };

  const handleSaveClick = async () => {
    // console.log("handleSaveClick function called");
    // console.log("id: ", id);
    // console.log("customer: ", customer);
    // console.log("directory: ", directory);
    // console.log("value: ", value);
    const valueWithoutHTMLtags = removeHtmlTags(value);
    // console.log("valueWithoutHTMLtags: ", valueWithoutHTMLtags);
    if (!directory || !valueWithoutHTMLtags) {
      setError(true);

      if (!directory && !valueWithoutHTMLtags) {
        setErrorDirectory(true);
        setErrorValue(true);
        setErrorMessage(
          "Folder name and notification text are required fields"
        );
      } else if (!directory) {
        setErrorDirectory(true);
        setErrorMessage("Folder name is required field");
      } else if (!valueWithoutHTMLtags) {
        setErrorValue(true);
        setErrorMessage("Notification text is required field");
      } else {
        setErrorMessage(
          "Error while saving a notification. Please contact an administrator"
        );
      }
      return null;
    }

    try {
      if (id) {
        await updateNotification({
          variables: {
            id: id,
            customer: customer,
            directory: directory,
            value: value,
          },
        });
      } else {
        await addNotification({
          variables: {
            customer: customer,
            directory: directory,
            value: value,
          },
        });
      }
      handleCloseClick();
    } catch (error) {
      // console.error("Error while saving a notification: ", error);
      setError(true);
      setErrorMessage(error.message);
    }
  };

  const handleDeleteNotificationClick = (id) => {
    // console.log("id: ", id);
    try {
      deleteNotification({
        variables: { id },
      });
    } catch (error) {
      console.error("Error while deleting a notification: ", error);
    }
    const notificationsWithoutDeletedOne = notifications.filter(
      (notification) => {
        return notification.id !== id;
      }
    );

    setNotifications(notificationsWithoutDeletedOne);
  };

  const handleEditNotificationClick = (id, customer, directory, value) => {
    setId(id);
    if (!customer) customer = "";
    setCustomer(customer);
    setDirectory(directory);
    setDisabledDirectory(true);
    setValue(value);
    setOpen(true);
  };

  function removeHtmlTags(input) {
    // Use a regular expression to match and remove HTML tags
    return input.replace(/<[^>]*>/g, "");
  }

  const renderItem = (node) => {
    // console.log("node.customer: ", node.customer);
    return (
      <Box sx={{ flexGrow: 1, overflow: "hidden", px: 3 }} key={node.id}>
        <StyledPaper
          sx={{
            my: 1,
            mx: "auto",
            p: 2,
            transition: "background-color 0.3s ease",
            // padding: "16px"
            ...hoverClass,
          }}
        >
          <Grid container wrap="nowrap" spacing={2}>
            <Grid item xs={2} zeroMinWidth>
              <Typography noWrap> {node.customer} </Typography>
            </Grid>

            <Grid item xs={2} zeroMinWidth>
              <Typography noWrap> {node.directory} </Typography>
            </Grid>

            <Grid item xs={7} zeroMinWidth>
              <Typography noWrap> {removeHtmlTags(node.value)} </Typography>
            </Grid>

            <Grid
              item
              xs={1}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <IconButton
                sx={{ marginLeft: "20px", zIndex: 1 }}
                edge="end"
                aria-label="delete"
                onClick={() =>
                  handleEditNotificationClick(
                    node.id,
                    node.customer,
                    node.directory,
                    node.value
                  )
                }
              >
                <EditIcon />
              </IconButton>
              <IconButton
                sx={{ marginLeft: "20px", zIndex: 1 }}
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteNotificationClick(node.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </StyledPaper>
      </Box>
    );
  };

  const renderGrid = (nodes) => {
    console.log("Notifications passed to renderGrid:", nodes);

    return (
      <Box
        sx={{
          overflow: "auto",
          height: "calc(100vh - 100px)",
        }}
      >
        {/* Header Row + Add Button */}
        <Box sx={{ flexGrow: 1, px: 3, position: "sticky", top: 0, zIndex: 2 }}>
          <StyledPaper sx={{ my: 1, mx: "auto", p: 2, overflow: "hidden" }}>
            <Grid container wrap="nowrap" spacing={2}>
              <Grid item xs={2} zeroMinWidth>
                <Typography noWrap style={headerStyle}>
                  Customer Name
                </Typography>
              </Grid>
              <Grid item xs={2} zeroMinWidth>
                <Typography noWrap style={headerStyle}>
                  Folder Name
                </Typography>
              </Grid>
              <Grid item xs={2} zeroMinWidth>
                <Typography noWrap style={headerStyle}>
                  Notification
                </Typography>
              </Grid>
              <Grid
                item
                xs={6}
                zeroMinWidth
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  onClick={handleAddNotificationClick}
                  color="primary"
                  variant="contained"
                >
                  Add notification
                </Button>
              </Grid>
            </Grid>
          </StyledPaper>
        </Box>

        {/* Notification List */}
        {Array.isArray(nodes) && nodes.length > 0 ? (
          nodes.map((node) => renderItem(node))
        ) : (
          <Box sx={{ px: 3 }}>
            <Typography>No notifications available.</Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <CssBaseline />
      {renderGrid(notifications)}
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleCloseClick();
          }
        }}
        fullWidth
        PaperProps={{
          sx: dialogStyles,
        }}
        ref={dialogRef}
      >
        <div style={resizableHandleStyles} />
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {id ? "Edit the notification" : "Add a new notification"}
          <IconButton
            edge="end"
            color="primary"
            onClick={handleCloseClick}
            aria-label="close"
            sx={{ position: "absolute", top: 0, right: 10, color: "red" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Customer Name (optional)"
            fullWidth
            variant="outlined"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            sx={{
              marginTop: "10px",
            }}
          />

          <TextField
            disabled={disabledDirectory}
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
            error={errorDirectory}
            sx={{
              marginTop: "10px",
            }}
          />

          <ReactQuill
            value={value}
            onChange={handleValueChange}
            style={{
              marginTop: "10px",
              border: errorValue ? "1px solid red" : "",
            }}
            modules={{
              toolbar: [
                [{ header: "1" }, { header: "2" }],
                ["bold", "italic", "underline", "strike"],
                [{ align: [] }],
                ["link", "image"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "bold",
              "italic",
              "underline",
              "strike",
              "link",
              "image",
              "list",
              "bullet",
              "align",
            ]}
          />
        </DialogContent>
        {error && (
          <Fade
            in={error} //Write the needed condition here to make it appear
            timeout={{ enter: 1000, exit: 4000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
            addEndListener={() => {
              setTimeout(() => {
                setError(false);
                setErrorDirectory(false);
                setErrorValue(false);
                //       setErrorMessage("");
              }, 5000);
            }}
          >
            <Alert severity="error">{errorMessage}</Alert>
          </Fade>
        )}
        <DialogActions>
          <Button onClick={handleSaveClick} color="primary" variant="contained">
            Save
          </Button>
          <Button onClick={handleCloseClick} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
