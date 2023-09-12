import { gql } from "@apollo/client";

export const GET_NOTIFICATION = gql`
  query GetNotification {
    getNotification {
      directory
      value
    }
  }
`;
