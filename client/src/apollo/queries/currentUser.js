import { gql, useQuery } from "@apollo/client";

export const GET_CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      username
    }
  }
`;

export const useCurrentUserQuery = (options) =>
  useQuery(GET_CURRENT_USER, options);
