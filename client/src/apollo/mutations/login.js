import { gql, useMutation } from "@apollo/client";

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

export const useLoginMutation = () => {
  return useMutation(LOGIN);
};
