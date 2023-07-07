import gql from "graphql-tag";

export const QUERY_FILES = gql`
  query Files {
    files {
      id
      name
      type
      folders
    }
  }
`;
