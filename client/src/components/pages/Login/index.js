import { gql, useMutation } from "@apollo/client";

export const LOGIN = gql`
    mutation login (
        username: String!
        pasword: String!
      ): Auth
    }

    mutation addUser (
        username: String!
        pasword: String!
      ): Auth
    }
`