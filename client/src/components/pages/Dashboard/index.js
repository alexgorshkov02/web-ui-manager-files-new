import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import { GET_NOTIFICATIONS } from "../../../apollo/queries/getNotifications";
import {
  useSetNotification,
  useDeleteNotification,
} from "../../../apollo/mutations";

const drawerWidth = 240;

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [value, setInputValue] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);

  const [
    addOrUpdateNotification
    // { loadingAddOrUpdateNotification, errorAddOrUpdateNotification },
  ] = useSetNotification();

  const [
    deleteNotification
    // { loadingDeleteNotification, errorDeleteNotification },
  ] = useDeleteNotification();

  const {
    // data,
    // loading,
    // error,
    refetch: refetchNotifications,
  } = useQuery(GET_NOTIFICATIONS, {
    onCompleted: (completedData) => {
      setNotifications(completedData.getNotifications);
    },
  });

  useEffect(() => {
    refetchNotifications().then((result) => {
      if (result.data) {
        setNotifications(result.data.getNotifications);
      }
    });
  }, [notifications, refetchNotifications]);

  const handleNotificationClick = (notification) => {
    setInputValue("");
    setIsInputVisible(false);
    setSelectedNotification(notification);
  };

  const handleAddNotificationClick = (event) => {
    setSelectedNotification(null);
    console.log("Clicked", event.currentTarget);
    setAnchorEl(anchorEl ? null : event?.currentTarget);
    setIsInputVisible(true);
  };

  const handleInputChange = (event) => {
    console.log("event.target.value: ", event.target.value);
    const { value } = event.target;
    setInputValue(value);
  };

  const handleSaveDirectoryClick = () => {
    // Handle the logic to save the input value as a notification

    console.log("Saved notification:", value);
    // console.log("event.target: ", event.target);
    // console.log("name: ", paramName, "value: ", newValue);
    try {
      addOrUpdateNotification({
        variables: { directory: value, value: "" },
      });
    } catch (error) {
      console.error("Error: ", error);
    }

    setNotifications([...notifications, value]); // Update the state with the new array

    // Clear the input field and hide it
    setInputValue("");
    setIsInputVisible(false);
  };

  const handleCancelClick = () => {
    // console.log("Cancelled");
    
    // Clear the input field and hide it
    setInputValue("");
    setIsInputVisible(false);
    setSelectedNotification(null);
  };

  const handleDeleteNotificationClick = (notification) => {
    // Handle the logic to save the input value as a notification
    console.log("notification: ", notification);
    try {
      deleteNotification({
        variables: { directory: notification.directory },
      });
    } catch (error) {
      console.error("Error: ", error);
    }
    const newNotifications = notifications.filter((not) => {
      // Replace "valueToRemove" with the specific value you want to remove
      return not.directory !== notification.directory;
    });

    // Update the state with the new array
    setNotifications(newNotifications);
  };

  const handleSaveNotificationClick = (event) => {
    // Handle the logic to save the input value as a notification

    console.log("Saved notification:", selectedNotification);
    console.log("value: ", value);
    // console.log("name: ", paramName, "value: ", newValue);
    // const newValue = event.target.value;
    try {
      addOrUpdateNotification({
        variables: {
          directory: selectedNotification.directory,
          value: value,
        },
      });
    } catch (error) {
      console.error("Error: ", error);
    }

    const updatedData = notifications.map((notification) => {
      if (notification.directory === selectedNotification.directory) {
        // If the id matches, update the age field
        return { ...notification, value: value };
      }
      return notification; // Otherwise, return the original object
    });
    console.log("updatedData: ", updatedData);
    setNotifications(updatedData); // Update the state with the new array

    // Clear the input field and hide it
    // setInputValue("");
    setIsInputVisible(false);
  };

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
        style={{ zIndex: 100 }}
      >
        <Toolbar />
        <Divider />

        <List>
          {notifications.map((notification, index) => (
            <ListItemButton
              key={index}
              selected={selectedNotification === notification}
              onClick={() => handleNotificationClick(notification)}
            >
              <ListItemText primary={notification.directory} />
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteNotificationClick(notification)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemButton>
          ))}
          {isInputVisible ? (
            <Box>
              <TextField
                fullWidth
                label="Type a new notification"
                value={value}
                onChange={handleInputChange}
              />
              <IconButton
                color="primary"
                aria-label="Save"
                onClick={(event) => handleSaveDirectoryClick(event)}
              >
                <CheckIcon fontSize="large" />
              </IconButton>
              <IconButton
                aria-label="Add"
                onClick={handleCancelClick}
                color="primary"
              >
                <CloseIcon fontSize="large" />
              </IconButton>
            </Box>
          ) : (
            <IconButton
              aria-label="Add"
              onClick={handleAddNotificationClick}
              color="primary"
            >
              <AddIcon fontSize="large" />
            </IconButton>
          )}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default" }}>
        <Toolbar />
        <div style={{ height: 400, width: "100%" }}>
          {selectedNotification ? (
            <Box>
              <TextareaAutosize
                minRows={4} // Set the minimum number of rows
                maxRows={10} // Set the maximum number of rows (optional)
                value={value ? value : selectedNotification?.value}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  resize: "vertical",
                  overflow: "auto",
                }}
              />
              <IconButton
                color="primary"
                aria-label="Save"
                onClick={(event) => handleSaveNotificationClick(event)}
              >
                <CheckIcon fontSize="large" />
              </IconButton>
              <IconButton
                aria-label="Add"
                onClick={handleCancelClick}
                color="primary"
              >
                <CloseIcon fontSize="large" />
              </IconButton>
            </Box>
          ) : (
            <div>Select a notification</div>
          )}
        </div>
      </Box>
    </Box>
  );
}
