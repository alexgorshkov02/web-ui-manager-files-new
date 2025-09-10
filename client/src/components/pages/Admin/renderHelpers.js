import React, { Fragment } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { green } from "@mui/material/colors";
import { handleSaveField } from "./saveHelpers";
import {
  getGroupForParam,
  getParamValue,
  getParamBoolean,
  getParamName,
} from "./getHelpers";
import {
  parameters,
  idAuthLdap,
  idAuthLdapUseSSL,
  idAuthLdapCertPath,
  idAuthLdapServer,
  idAuthLdapPort,
  idAuthBindDN,
  idAuthBindPassword,
  idAuthBaseDN,
  idLdap,
  idLdapUseSSL,
  idLdapCertPath,
  idLdapServer,
  idLdapPort,
  idBindDN,
  idBindPassword,
  idBaseDN,
  idScope,
  idFilter,
  idAttribute,
  switchType,
  toggleType,
  authenticationGroup,
  foldersGroup,
} from "./adminParameters";

const handleLocalChange = (event, paramName, context) => {
  const { adminParam, setAdminParam, setEditedFields, setSavedFields } =
    context;
  const newValue = event.target.value;
  const group = getGroupForParam(paramName);
  if (!group) return;

  const updatedGroup = [...(adminParam[group] || [])];
  const index = updatedGroup.findIndex((p) => p.name === paramName);

  if (index !== -1)
    updatedGroup[index] = { ...updatedGroup[index], value: newValue };
  else updatedGroup.push({ name: paramName, value: newValue });

  setAdminParam({ ...adminParam, [group]: updatedGroup });

  setEditedFields((prev) => ({ ...prev, [paramName]: true }));
  setSavedFields((prev) => {
    if (prev[paramName]) {
      const copy = { ...prev };
      delete copy[paramName];
      return copy;
    }
    return prev;
  });
};

const handleToggleChange = async (newValue, paramName, context) => {
  if (newValue === null) return;
  handleLocalChange({ target: { value: newValue } }, paramName, context);
  await handleSaveField(paramName, newValue, context);
};

const renderField = (parameter, groupKey, context) => {
  const { theme, adminParam, editedFields, savedFields } = context;

  const value = getParamValue(adminParam, groupKey, parameter.id) ?? "";

  if (parameter.type === toggleType) {
    const toggleValue = value || "false";
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
          overflow: "hidden",
          height: 40,
          width: 160,
          userSelect: "none",
          m: 1,
          position: "relative",
        }}
      >
        <ToggleButtonGroup
          value={toggleValue}
          exclusive
          onChange={(e, v) => handleToggleChange(v, parameter.id, context)}
          sx={{
            width: "100%",
            height: "100%",
            "& .MuiToggleButton-root": {
              flex: 1,
              border: "none",
              borderRadius: 0,
              color: theme.palette.text.primary,
              fontWeight: theme.typography.fontWeightMedium,
              textTransform: "none",
              fontSize: theme.typography.pxToRem(14),
              "&.Mui-selected": {
                bgcolor: theme.palette.primary.main,
                color: "#fff",
                fontWeight: theme.typography.fontWeightBold,
              },
              "&.Mui-selected:hover": {
                bgcolor: theme.palette.primary.main,
                color: "#fff",
              },
            },
          }}
        >
          <ToggleButton value="false" aria-label="Local">
            Local
          </ToggleButton>
          <ToggleButton value="true" aria-label="LDAP">
            LDAP
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    );
  }

  if (parameter.type === switchType) {
    return (
      <FormControlLabel
        key={parameter.id}
        control={
          <Switch
            id={parameter.id}
            name={parameter.id}
            checked={value === "true"}
            onChange={async (e) => {
              const newVal = e.target.checked.toString();
              handleLocalChange(
                { target: { value: newVal } },
                parameter.id,
                context
              );
              await handleSaveField(parameter.id, newVal, context);
            }}
          />
        }
        label={parameter.label}
        sx={{ m: 1 }}
      />
    );
  }

  // Default text field
  const sharedProps = {
    key: parameter.id,
    id: parameter.id,
    name: parameter.id,
    label: parameter.label,
    variant: "outlined",
    value,
    onChange: (e) => handleLocalChange(e, parameter.id, context),
  };
  if (parameter.id === idAuthBindPassword || parameter.id === idBindPassword)
    sharedProps.type = "password";
  let width = "40%";
  if (parameter.id === idAuthLdapCertPath || parameter.id === idLdapCertPath)
    width = "70%";
  if (parameter.id === idAuthLdapServer || parameter.id === idLdapServer)
    width = "60%";
  if (parameter.id === idAuthLdapPort || parameter.id === idLdapPort)
    width = "20%";

  return (
    <Box
      key={parameter.id}
      sx={{ m: 1, width, position: "relative", display: "inline-block" }}
    >
      <TextField {...sharedProps} sx={{ width: "100%" }} />

      {/* Save icon */}
      {editedFields[parameter.id] && !savedFields[parameter.id] && (
        <IconButton
          size="small"
          color="primary"
          onClick={async () => {
            const param = (adminParam[groupKey] || []).find(
              (p) => p.name === parameter.id
            );
            if (param)
              await handleSaveField(parameter.id, param.value, context);
          }}
          sx={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "background.paper",
            boxShadow: 1,
            "&:hover": { bgcolor: "primary.light" },
          }}
        >
          <SaveIcon fontSize="small" />
        </IconButton>
      )}
      {savedFields[parameter.id] && (
        <CheckCircleIcon
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            color: green[500],
            fontSize: 24,
          }}
        />
      )}
    </Box>
  );
};

const renderLdapGroup = (groupName, params, idPrefix, context) => {
  const { adminParam } = context;

  const groupKey = groupName.toLowerCase();
  const ldapToggleValue = getParamBoolean(adminParam, groupKey, idPrefix);
  const sslSwitchParamId =
    idPrefix === idAuthLdap ? idAuthLdapUseSSL : idLdapUseSSL;
  const sslSwitchParamName = getParamName(
    adminParam,
    groupKey,
    sslSwitchParamId
  );

  const sslSwitchValue = getParamBoolean(
    adminParam,
    groupKey,
    sslSwitchParamId
  );

  // Help function to get objects using their IDs
  const filterParams = (ids) => params.filter((p) => ids.includes(p.id));

  return (
    <Box key={groupName} sx={{ mt: 3 }}>
      <h3>{groupName}</h3>
      <Box sx={{ m: 1 }}>
        {filterParams([idPrefix]).map((param) => (
          <Fragment key={param.id}>
            {renderField(param, groupKey, context)}
          </Fragment>
        ))}
      </Box>

      {ldapToggleValue && (
        <>
          <Box sx={{ display: "flex", gap: 2, m: 1, width: "100ch" }}>
            {filterParams([sslSwitchParamName]).map((param) =>
              renderField(param, groupKey, context)
            )}
            {sslSwitchValue &&
              filterParams([idAuthLdapCertPath, idLdapCertPath]).map((param) =>
                renderField(param, groupKey, context)
              )}
          </Box>

          <Box sx={{ display: "flex", gap: 2, m: 1, width: "100ch" }}>
            {filterParams([
              idAuthLdapServer,
              idLdapServer,
              idAuthLdapPort,
              idLdapPort,
            ]).map((param) => renderField(param, groupKey, context))}
          </Box>

          <Box sx={{ display: "flex", gap: 2, m: 1, width: "100ch" }}>
            {filterParams([
              idPrefix === idAuthLdap ? idAuthBindDN : idBindDN,
              idPrefix === idAuthLdap ? idAuthBindPassword : idBindPassword,
            ]).map((param) => renderField(param, groupKey, context))}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              m: 1,
              width: "100ch",
              flexWrap: "wrap",
            }}
          >
            {filterParams(
              idPrefix === idAuthLdap
                ? [idAuthBaseDN]
                : [idBaseDN, idScope, idFilter, idAttribute]
            ).map((param) => renderField(param, groupKey, context))}
          </Box>
        </>
      )}
    </Box>
  );
};

const renderFields = (context) =>
  Object.entries(parameters).map(([groupName, params]) => {
    console.log("parameters: ", parameters);
    const key = groupName.toLowerCase();
    console.log("groupName: ", groupName);
    if (key === authenticationGroup)
      return renderLdapGroup(groupName, params, idAuthLdap, context);
    if (key === foldersGroup)
      return renderLdapGroup(groupName, params, idLdap, context);

    return (
      <Box key={groupName} sx={{ mt: 3 }}>
        <h3>{groupName}</h3>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            m: 1,
            width: "100ch",
            gap: 2,
          }}
        >
          {params.map((param) => renderField(param, key, context))}
        </Box>
      </Box>
    );
  });

export { renderFields };
