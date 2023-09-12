import { gql, useMutation } from "@apollo/client";

const SET_NOTIFICACTION = gql`
mutation SetNotification($directory: String!, $value: String) {
    setNotification(directory: $name, value: $value) {
      name
      value
    }
  }
`;
export const useSetNotification = () => {
  return useMutation(SET_NOTIFICACTION);
};
