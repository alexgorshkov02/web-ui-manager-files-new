import { gql } from "@apollo/client";

export const GET_DIRECTORIES = gql`
  query GetDirectories {
    directories {
      name
      path
      type
      relativePath
      children {
        name
        path
        type
        relativePath
        children {
          name
          path
          type
          relativePath
          children {
            name
            path
            type
            relativePath
            children {
              name
              path
              type
              relativePath
            }
          }
        }
      }
    }
  }
`;
