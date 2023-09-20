import { gql } from "@apollo/client";

export const GET_DIRECTORIES = gql`
  query GetDirectories {
    directories {
      name
      type
      relativePath
      children {
        name
        type
        relativePath
        children {
          name
          type
          relativePath
          children {
            name
            type
            relativePath
            children {
              name
              type
              relativePath
            }
          }
        }
      }
    }
  }
`;
