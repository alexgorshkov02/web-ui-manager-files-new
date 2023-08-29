import { gql } from "@apollo/client";

export const GET_CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      username
      password
    }
  }
`;