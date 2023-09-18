import { gql, useMutation } from "@apollo/client";

const UPDATE_NOTIFICATION = gql`
mutation updateNotification($id: ID!, $customer: String, $directory: String!, $value: String) {
  updateNotification(id: $id, customer: $customer, directory: $directory, value: $value) {
    id
    customer
    directory
    value
  }
}
`;
export const useUpdateNotification = () => {
  return useMutation(UPDATE_NOTIFICATION);
};
