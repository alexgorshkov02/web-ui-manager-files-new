const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  directive @auth on QUERY | FIELD_DEFINITION | FIELD

  # This "Directory" type defines the queryable fields for every directory in our data source.
  type Directory {
    path: String
    name: String
    type: String
    children: [Directory]
  }

  type File {
    name: String
    size: String
    ctime: String
    path: String
  }

  type User {
    id: ID!
    username: String!
    password: String!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "directories" query returns an array of zero or more Directories (defined above).
  type Query {
    directories: Directory @auth
    files(directory: String): [File]
    users: [User]
    getFiles(directory: String): [File] @auth
    currentUser: User @auth
  }

  # Recursive loading of subfolders
  fragment allDirectories on Directory {
    name
    children {
      ...allDirectories
    }
  }

  type Auth {
    token: String
  }

  type Mutation {
    login (username: String!, password: String!): Auth
    signup(username: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
