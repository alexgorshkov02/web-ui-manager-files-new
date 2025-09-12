import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Button from "@mui/material/Button";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useSetProfileParams } from "../../../apollo/mutations";
import { useQuery } from "@apollo/client";
import { GET_PROFILE_PARAMS } from "../../../apollo/queries/getProfileParams";

export default function Profile() {
  const [profileParam, setProfileParam] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const [updateProfileParam, { error: errorSetProfileParams }] =
    useSetProfileParams();

  const { error: errorGetProfileParams, refetch } = useQuery(
    GET_PROFILE_PARAMS,
    {
      onCompleted: (completedData) => {
        const params = completedData?.getProfileParams ?? {};
        const sorting = params.sorting ?? {};
        setProfileParam([
          { name: "sorting.field", value: sorting.field ?? "" },
          { name: "sorting.direction", value: sorting.direction ?? "" },
        ]);
      },
    }
  );

  useEffect(() => {
    async function fetchDataProfileParam() {
      try {
        await refetch();
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchDataProfileParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileParam]);

  const parameters = [
    { id: "sorting.field", label: "Sorting Field" },
    { id: "sorting.direction", label: "Sorting Direction" },
  ];

  const handleOptionChange = (event, paramName) => {
    const newValue = event.target.value;
    let sorting = {
      field: profileParam.find((p) => p.name === "sorting.field")?.value || "",
      direction:
        profileParam.find((p) => p.name === "sorting.direction")?.value || "",
    };

    // Prevent setting direction without field
    if (paramName === "sorting.direction" && !sorting.field) {
      setErrorMsg("Please select sorting field first.");
      return;
    }

    // Clear error if conditions are met
    setErrorMsg("");

    if (paramName === "sorting.field") sorting.field = newValue;
    else if (paramName === "sorting.direction") sorting.direction = newValue;

    try {
      updateProfileParam({
        variables: { sorting },
      });
    } catch (error) {
      console.error("Error: ", error);
    }

    const updated = profileParam.map((param) =>
      param.name === paramName ? { ...param, value: newValue } : param
    );

    if (!updated.some((param) => param.name === paramName)) {
      updated.push({ name: paramName, value: newValue });
    }

    setProfileParam(updated);
  };

  const handleResetSorting = async () => {
    try {
      await updateProfileParam({
        variables: {
          sorting: {
            field: "",
            direction: "",
          },
        },
      });

      setProfileParam([
        { name: "sorting.field", value: "" },
        { name: "sorting.direction", value: "" },
      ]);
    } catch (error) {
      console.error("Error resetting sorting:", error);
    }
  };
  const renderItem = (parameter) => {
    const value =
      profileParam.find((obj) => obj.name === parameter.id)?.value || "";

    if (parameter.id === "sorting.field") {
      return (
        <FormControl key={parameter.id} fullWidth>
          <InputLabel id={`${parameter.id}-label`}>
            {parameter.label}
          </InputLabel>
          <Select
            labelId={`${parameter.id}-label`}
            id={parameter.id}
            name={parameter.id}
            value={value}
            label={parameter.label}
            onChange={(event) => handleOptionChange(event, parameter.id)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="size">Size</MenuItem>
            <MenuItem value="ctime">Date</MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (parameter.id === "sorting.direction") {
      return (
        <FormControl key={parameter.id} fullWidth>
          <InputLabel id={`${parameter.id}-label`}>
            {parameter.label}
          </InputLabel>
          <Select
            labelId={`${parameter.id}-label`}
            id={parameter.id}
            name={parameter.id}
            value={value}
            label={parameter.label}
            onChange={(event) => handleOptionChange(event, parameter.id)}
          >
            <MenuItem value="asc">🔼</MenuItem>
            <MenuItem value="desc">🔽</MenuItem>
          </Select>
        </FormControl>
      );
    }
  };

  const renderFields = () =>
    Array.isArray(parameters) ? parameters.map(renderItem) : null;

  if (errorSetProfileParams || errorGetProfileParams) {
    return <div>Error loading profile parameters.</div>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          m: 1,
          width: "100ch",
          gap: 2,
        }}
      >
        <CssBaseline />
        {renderFields()}
        <Button
          sx={{ m: 1, width: "50ch" }}
          variant="contained"
          color="primary"
          onClick={handleResetSorting}
        >
          Reset Sorting
        </Button>
      </Box>
      {errorMsg && <Box sx={{ color: "red", mt: 1, ml: 1 }}>{errorMsg}</Box>}
    </Box>
  );
}
