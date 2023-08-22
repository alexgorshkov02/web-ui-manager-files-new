import { gql, useQuery } from "@apollo/client";

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

// export const useGetFilesQuery = (directory) => {
//   return useQuery(GET_FILES, {
//     variables: { directory },
//   });
// };