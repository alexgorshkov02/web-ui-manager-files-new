import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { useSetAdminParams } from "../../../apollo/mutations";
import { useQuery } from "@apollo/client";
import { GET_ADMIN_PARAMS } from "../../../apollo/queries/getAdminParams";

export default function Admin() {
  const [adminParam, setAdminParam] = useState("");

  const [updateAdminParam, { error: errorSetAdminParams }] =
    useSetAdminParams();

  if (errorSetAdminParams) {
    console.error("Error:", errorSetAdminParams);
  }

  const { error: errorGetAdminParams, refetch } = useQuery(GET_ADMIN_PARAMS, {
    onCompleted: (completedData) => {
      setAdminParam(completedData.getAdminParams);
    },
  });

  if (errorGetAdminParams) {
    console.error("Error:", errorGetAdminParams);
  }

  useEffect(() => {
    async function fetchDataAdminParam() {
      try {
        await refetch();
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchDataAdminParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminParam]);

  const parameters = [
    { id: "path-to-root-directory", label: "Path to root directory" },
    { id: "auth-ldap", label: "Auth ldap (true|false)" },
    { id: "auth-ldap-server", label: "Auth Ldap server IP address" },
    { id: "auth-ldap-port", label: "Auth Ldap server port" },
    { id: "auth-base-dn", label: "Auth Base DN" },
    { id: "ldap", label: "ldap (true|false)" },
    { id: "ldap-server", label: "Ldap server IP address" },
    { id: "ldap-port", label: "Ldap server port" },
    { id: "bind-dn", label: "Bind DN" },
    { id: "bind-password", label: "Bind password" },
    { id: "base-dn", label: "Base DN" },
    { id: "scope", label: "Scope (Search Options)" },
    { id: "filter", label: "Filter (Search Options)" },
    { id: "attributes", label: "Attributes (Search Options)" },
  ];

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
      <CssBaseline />
      {renderFields(parameters)}
    </Box>
  );
}
