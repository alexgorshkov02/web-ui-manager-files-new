import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useSetAdminParams } from "../../../apollo/mutations";
import { useQuery } from "@apollo/client";
import { GET_ADMIN_PARAMS } from "../../../apollo/queries/getAdminParams";

export default function Admin() {
  const [updateAdminParam, { loadingSetAdminParams, errorSetAdminParams }] =
    useSetAdminParams();
  const [adminParam, setAdminParam] = useState("");

  const {
    dataAdminParams,
    loadingGetAdminParams,
    errorGetAdminParams,
    refetch,
  } = useQuery(GET_ADMIN_PARAMS, {
    onCompleted: (completedData) => {
      // console.log("completedData: ", completedData.getAdminParams);
      setAdminParam(completedData.getAdminParams);
    },
  });
  // console.log("Admin component rendered");
  // console.log("adminParam:", adminParam);

  useEffect(() => {
    // console.log("adminParam changed:", adminParam);
    refetch();
  }, [adminParam]);

  const parameters = [
    {
      id: "ftp-server",
      label: "FTP server",
    },
    { id: "path-to-root-directory", label: "Path to root directory" },
  ];

  if (loadingGetAdminParams || loadingSetAdminParams) {
    // Show a loading message while data is loading
    return <p>Loading...</p>;
  }

  if (errorGetAdminParams || errorSetAdminParams) {
    // Handle query error
    if (errorGetAdminParams) {
      return (
        <p>Error fetching admin parameters: {errorGetAdminParams.message}</p>
      );
    } else if (errorSetAdminParams) {
      return (
        <p>Error setting admin parameters: {errorSetAdminParams.message}</p>
      );
    } else return null;
  }

  const handleTextChange = (event, paramName) => {
    const newValue = event.target.value;
    // console.log("event.target: ", event.target);
    // console.log("name: ", paramName, "value: ", newValue);
    try {
      updateAdminParam({
        variables: { name: paramName, value: newValue },
      });
    } catch (error) {
      console.error("Error: ", error);
    }

    const updatedAdminParam = adminParam.map((param) => {
      if (param.name === paramName) {
        // console.log("param.name === paramName");
        // Update the value property for the matching object
        return { ...param, value: newValue };
      }
      // Return unchanged objects
      // console.log("unchanged objects");
      return param;
    });

    // Check if the paramName doesn't exist, and if so, add a new object to the array
    if (!updatedAdminParam.some((param) => param.name === paramName)) {
      updatedAdminParam.push({ name: paramName, value: newValue });
    }

    // console.log("updatedAdminParam: ", updatedAdminParam);
    setAdminParam(updatedAdminParam); // Update the state with the new array
  };

  const renderFields = (parameters) =>
    Array.isArray(parameters)
      ? parameters.map((parameter) => renderItem(parameter))
      : null;

  const renderItem = (parameter) => {
    // console.log("parameter: ", parameter);
    // console.log("adminParam: ", adminParam);

    if (Array.isArray(adminParam)) {
      return (
        <TextField
          key={parameter.id}
          id={parameter.id}
          label={parameter.label}
          variant="outlined"
          value={
            adminParam.find((obj) => obj.name === parameter.id)?.value || ""
          }
          onChange={(event) => handleTextChange(event, parameter.id)}
        />
      );
    } else return null;
  };

  return (
    <Box
      component="form"
      sx={{
        "& > :not(style)": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off"
    >
      {renderFields(parameters)}
    </Box>
  );
}
