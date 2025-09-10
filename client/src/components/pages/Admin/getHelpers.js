import { parameters } from "./adminParameters";

const getGroupForParam = (paramName) => {
  for (const [group, paramList] of Object.entries(parameters)) {
    if (paramList.some((p) => p.id === paramName)) return group.toLowerCase();
  }
  return null;
};

const getParamValue = (adminParam, groupKey, paramId) => {
  if (!adminParam || !groupKey || !paramId) return undefined;

  const paramObj = adminParam[groupKey]?.find((p) => p.name === paramId);
//   console.log("paramObj?.value: ", paramObj?.value);
  return paramObj?.value;
};

// for toggles/switches
const getParamBoolean = (adminParam, groupKey, paramId) =>
  getParamValue(adminParam, groupKey, paramId) === "true";

const getParamName = (adminParam, groupKey, paramId) => {
  if (!adminParam || !groupKey || !paramId) return undefined;

  const paramObj = adminParam[groupKey]?.find((p) => p.name === paramId);
//   console.log("paramObj: ", paramObj?.name);
  return paramObj?.name;
};

export { getGroupForParam, getParamValue, getParamBoolean, getParamName };
