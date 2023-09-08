import { gql, useMutation } from "@apollo/client";

const SET_ADMIN_PARAMS = gql`
mutation SetAdminParams($name: String!, $value: String) {
    setAdminParams(name: $name, value: $value) {
      name
      value
    }
  }
`;
export const useSetAdminParams = () => {
  return useMutation(SET_ADMIN_PARAMS);
};
