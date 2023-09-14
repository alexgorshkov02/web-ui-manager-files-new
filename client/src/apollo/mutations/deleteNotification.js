import { gql, useMutation } from "@apollo/client";

const DELETE_NOTIFICATION = gql`
mutation deleteNotification($directory: String!) {
    deleteNotification(directory: $directory) {
      directory
    }
  }
`;
export const useDeleteNotification = () => {
  return useMutation(DELETE_NOTIFICATION);
};
