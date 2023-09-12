import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import { GET_NOTIFICATIONS } from "../../../apollo/queries/getNotifications";

const drawerWidth = 240;

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const { data, loading, error } = useQuery(GET_NOTIFICATIONS, {
    onCompleted: (completedData) => {
      setNotifications(completedData.getNotifications);
    },
  });

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
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
      >
        <Toolbar />
        <Divider />

        <List>
          {notifications.map((notification) => (
            <ListItemButton
              key={notification.directory}
              selected={selectedNotification === notification}
              onClick={() => handleNotificationClick(notification)}
            >
              <ListItemText primary={notification.directory} />
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default" }}>
        <Toolbar />
        <div style={{ height: 400, width: "100%" }}>
          <div>Select a folder</div>
        </div>
      </Box>
    </Box>
  );
}
