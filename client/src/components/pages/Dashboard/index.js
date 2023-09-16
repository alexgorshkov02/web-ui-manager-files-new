import * as React from "react";
import { useState, useEffect, createRef } from "react";
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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useQuery } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../../../apollo/queries/getNotifications";
import {
  useSetNotification,
  useDeleteNotification,
} from "../../../apollo/mutations";

//TODO: Add checking for the mandatory fields: directory and value. Show an error if they are missed
//TODO: Show an error in UI if a user tries to add an existed directory

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

// Define a CSS class for the hover effect
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
  const [value, setValue] = useState("");
  const handleValueChange = (value) => {
    setValue(value);
  };
  const dialogRef = createRef();

  const { refetch: refetchNotifications } = useQuery(GET_NOTIFICATIONS, {
    onCompleted: (completedData) => {
      setNotifications(completedData.getNotifications);
    },
  });

  const [addOrUpdateNotification] = useSetNotification();
  const [deleteNotification] = useDeleteNotification();

  useEffect(() => {
    refetchNotifications().then((result) => {
      if (result.data) {
        setNotifications(result.data.getNotifications);
      }
    });
  }, [notifications, open, refetchNotifications]);

  useEffect(() => {
    if (!open) {
      setId("");
      setCustomer("");
      setDirectory("");
      setValue("");
    }
  }, [open]);

  const handleCloseClick = () => {
    setOpen(false);
  };

  const handleAddNotificationClick = () => {
    setOpen(true);
  };

  const handleSaveClick = () => {
    // console.log("id: ", id);
    // console.log("customer: ", customer);
    // console.log("directory: ", directory);
    // console.log("value: ", value);
    try {
      addOrUpdateNotification({
        variables: {
          id: id,
          customer: customer,
          directory: directory,
          value: value,
        },
      });
    } catch (error) {
      console.error("Error while saving a notification: ", error);
    }

    handleCloseClick();
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
    if (Array.isArray(nodes) && nodes.length > 0) {
      return (
        <Box
          sx={{
            // Make the container scrollable
            overflow: "auto",
            height: "calc(100vh - 100px)",
          }}
        >
          <Box
            sx={{ flexGrow: 1, px: 3, position: "sticky", top: 0, zIndex: 2 }}
          >
            <StyledPaper
              sx={{
                my: 1,
                mx: "auto",
                p: 2,
                overflow: "hidden",
              }}
            >
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
          {nodes.map((node) => renderItem(node))}
        </Box>
      );
    } else return null;
  };

  return (
    <Box>
      {renderGrid(notifications)}
      <Dialog
        open={open}
        onClose={handleCloseClick}
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
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
            sx={{
              marginTop: "10px",
            }}
          />

          <ReactQuill
            value={value}
            onChange={handleValueChange}
            style={{ marginTop: "10px" }}
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
