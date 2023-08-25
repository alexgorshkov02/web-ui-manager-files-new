import { gql } from "@apollo/client";

export const GET_FILES = gql`
  query GetFiles($directory: String) {
    getFiles(directory: $directory) {
      name
      size
      ctime
      path
    }
  }
`;