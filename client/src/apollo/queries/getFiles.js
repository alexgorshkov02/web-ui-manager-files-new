import { gql } from "@apollo/client";

export const GET_FILES = gql`
  query Files($directory: String) {
    files(directory: $directory) {
      name
      size
      ctime
      type
      path
      relativePath
    }
  }
`;