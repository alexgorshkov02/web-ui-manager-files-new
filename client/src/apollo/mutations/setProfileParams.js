import { gql, useMutation } from "@apollo/client";

const SET_PROFILE_PARAMS = gql`
  mutation SetProfileParams($sorting: SortingInput) {
    setProfileParams(sorting: $sorting) {
      sorting {
        field
        direction
      }
    }
  }
`;

export const useSetProfileParams = () => {
  return useMutation(SET_PROFILE_PARAMS);
};