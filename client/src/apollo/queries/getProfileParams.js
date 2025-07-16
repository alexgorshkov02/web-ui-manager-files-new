import { gql } from "@apollo/client";

export const GET_PROFILE_PARAMS = gql`
  query GetProfileParams {
    getProfileParams {
      sorting {
        field
        direction
      }
    }
  }
`;