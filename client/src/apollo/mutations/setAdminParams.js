import { gql, useMutation } from "@apollo/client";

const SET_ADMIN_PARAMS = gql`
mutation SetAdminParams($name: String!, $value: String, $group: String) {
    setAdminParams(name: $name, value: $value, group: $group) {
      name
      value
      group
    }
  }
`;
export const useSetAdminParams = () => {
  return useMutation(SET_ADMIN_PARAMS);
};
