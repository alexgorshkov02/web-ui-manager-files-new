import { gql, useMutation } from "@apollo/client";

const ADD_OR_UPDATE_NOTIFICATION = gql`
mutation AddOrUpdateNotification($directory: String!, $value: String) {
    addOrUpdateNotification(directory: $directory, value: $value) {
      directory
      value
    }
  }
`;
export const useSetNotification = () => {
  return useMutation(ADD_OR_UPDATE_NOTIFICATION);
};
