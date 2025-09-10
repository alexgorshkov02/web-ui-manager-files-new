import { gql } from "@apollo/client";

export const GET_ADMIN_PARAMS = gql`
  query GetAdminParams {
    getAdminParams {
      general {
        name
        value
      }
      authentication {
        name
        value
      }
      folders {
        name
        value
      }
    }
  }
`;
