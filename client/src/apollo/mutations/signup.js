import { gql, useMutation } from "@apollo/client";

const SIGNUP = gql`
  mutation Signup($username: String!, $password: String!) {
    signup(username: $username, password: $password) {
      token
    }
  }
`;
export const useSignupMutation = () => {
  return useMutation(SIGNUP);
};
