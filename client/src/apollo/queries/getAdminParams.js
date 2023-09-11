import { gql } from "@apollo/client";

export const GET_ADMIN_PARAMS = gql`
  query GetAdminParams {
    getAdminParams {
      name
      value
    }
  }
`;
