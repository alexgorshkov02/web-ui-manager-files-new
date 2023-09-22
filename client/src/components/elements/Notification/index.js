import { Grid, Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";

export default function DataGridFiles({
  notification,
  acceptNotification,
  declineNotification,
}) {
  const sanitizeHTML = (html) => {
    return { __html: html };
  };
  return (
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
        <Button onClick={declineNotification} variant="contained" color="error">
          Decline
        </Button>
      </Stack>
    </Grid>
  );
}
