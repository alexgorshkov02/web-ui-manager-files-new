import { gql, useQuery } from "@apollo/client";

// Define query
export const GET_DIRECTORIES = gql`
  query GetDirectories {
    directories {
      name
      path
      type
      children {
        name
        path
        type
        children {
          name
          path
          type
          children {
            name
            path
            type
            children {
              name
              path
              type
            }
          }
        }
      }
    }
  }
`;