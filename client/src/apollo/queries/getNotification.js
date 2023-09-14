import { gql } from "@apollo/client";

export const GET_NOTIFICATION = gql`
  query GetNotification($directory: String) {
    getNotification (directory: $directory){
      directory
      value
    }
  }
`;
