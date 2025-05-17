import Cookies from "js-cookie";

const AuthLink = (operation, next) => {
  const token = Cookies.get("jwt");
  // console.log("AuthLink, token (client_part): ", token);
  if (token) {
    operation.setContext((contextValue) => ({
      ...contextValue,
      headers: {
        ...contextValue.headers,
        Authorization: `Bearer ${token}`,
        'x-apollo-operation-name': 'safe-request',
      },
    }));
    // console.log("AuthLink, operation (client_part): ", operation);
  }
  return next(operation);
};

export default AuthLink;
