import { gql, useMutation } from "@apollo/client";

const ADD_OR_UPDATE_NOTIFICATION = gql`
mutation AddOrUpdateNotification($id: ID, $customer: String, $directory: String!, $value: String) {
  addOrUpdateNotification(id: $id, customer: $customer, directory: $directory, value: $value) {
    directory
    value
    customer
    id
  }
}
`;
export const useSetNotification = () => {
  return useMutation(ADD_OR_UPDATE_NOTIFICATION);
};
