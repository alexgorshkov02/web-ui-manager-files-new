import { getGroupForParam } from "./getHelpers";

const handleSaveField = async (paramName, newValue, context) => {
  const { setEditedFields, setSavedFields, updateAdminParam } = context;
  const group = getGroupForParam(paramName);
  if (!group) return;

  try {
    await updateAdminParam({
      variables: { name: paramName, value: newValue, group },
    });

    setEditedFields((prev) => {
      const copy = { ...prev };
      delete copy[paramName];
      return copy;
    });

    setSavedFields((prev) => ({ ...prev, [paramName]: true }));
    setTimeout(() => {
      setSavedFields((prev) => {
        const copy = { ...prev };
        delete copy[paramName];
        return copy;
      });
    }, 1500);
  } catch (error) {
    console.error("Failed to save field: ", paramName, error);
  }
};

const handleSaveAll = async (context) => {
  const {
    adminParam,
    editedFields,
    setEditedFields,
    setSavedFields,
    updateAdminParam,
  } = context;
  try {
    const fieldsToSave = Object.keys(editedFields);
    for (const paramName of fieldsToSave) {
      const group = getGroupForParam(paramName);

      const param = (adminParam[group] || []).find((p) => p.name === paramName);
      if (param) {
        await updateAdminParam({
          variables: { name: paramName, value: param.value, group },
        });
      }
    }
    setEditedFields({});
    const newSaved = {};
    fieldsToSave.forEach((name) => (newSaved[name] = true));
    setSavedFields(newSaved);
    setTimeout(() => setSavedFields({}), 1500);
  } catch (error) {
    console.error("Error saving all parameters: ", error);
  }
};

export { handleSaveField, handleSaveAll };
