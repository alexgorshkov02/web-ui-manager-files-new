import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { useSetAdminParams } from "../../../apollo/mutations";
import { useQuery } from "@apollo/client";
import { GET_ADMIN_PARAMS } from "../../../apollo/queries/getAdminParams";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material";
import { renderFields } from "./renderHelpers";
import { handleSaveAll } from "./saveHelpers";

export default function Admin() {
  const theme = useTheme();
  const [adminParam, setAdminParam] = useState({
    general: [],
    authentication: [],
    folders: [],
  });

  const [editedFields, setEditedFields] = useState({});
  const [savedFields, setSavedFields] = useState({});

  const [updateAdminParam] = useSetAdminParams();

  const { refetch } = useQuery(GET_ADMIN_PARAMS, {
    onCompleted: (completedData) => {
      const params = completedData?.getAdminParams ?? {
        general: [],
        authentication: [],
        folders: [],
      };
      setAdminParam(params);
      setEditedFields({});
      setSavedFields({});
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <Box sx={{ p: 2 }}>
      <CssBaseline />
      {renderFields({
        theme,
        adminParam,
        editedFields,
        savedFields,
        setAdminParam,
        setEditedFields,
        setSavedFields,
        updateAdminParam,
      })}
      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          handleSaveAll({
            adminParam,
            editedFields,
            setEditedFields,
            setSavedFields,
            updateAdminParam,
          })
        }
        sx={{ mt: 3 }}
      >
        Save All
      </Button>
    </Box>
  );
}
