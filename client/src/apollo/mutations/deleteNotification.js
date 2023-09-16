import { gql, useMutation } from "@apollo/client";

const DELETE_NOTIFICATION = gql`
mutation deleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      id
    }
  }
`;
export const useDeleteNotification = () => {
  return useMutation(DELETE_NOTIFICATION);
};
