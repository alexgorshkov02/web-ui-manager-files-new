import { gql, useMutation } from "@apollo/client";

const ADD_UPDATE_NOTIFICATION = gql`
mutation addNotification($customer: String, $directory: String!, $value: String) {
  addNotification(customer: $customer, directory: $directory, value: $value) {
    customer
    directory
    value
  }
}
`;
export const useAddNotification = () => {
  return useMutation(ADD_UPDATE_NOTIFICATION);
};
