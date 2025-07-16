const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  directive @auth on QUERY | FIELD_DEFINITION | FIELD

  # This "Directory" type defines the queryable fields for every directory in our data source.
  type Directory {
    name: String
    type: String
    relativePath: String
    children: [Directory]
  }

  type File {
    name: String
    size: String
    ctime: String
    type: String
    relativePath: String
    children: [File]
  }

  type User {
    id: ID!
    username: String!
    role: String!
  }

  type AdminParams {
    name: String
    value: String
  }

  type Notification {
    id: ID!
    customer: String
    directory: String
    value: String
  }

  type SortParams {
    field: String
    direction: String # "asc" or "desc"
  }

  type ProfileParams {
    sorting: SortParams
  }


  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "directories" query returns an array of zero or more Directories (defined above).
  type Query {
    directories: Directory @auth
    files(directory: String): File @auth
    users: [User]
    currentUser: User @auth
    getAdminParams: [AdminParams] @auth
    getProfileParams: ProfileParams @auth
    getNotification(directory: String): Notification
    getNotifications: [Notification]
  }

  # Recursive loading of subfolders
  fragment allDirectories on Directory {
    name
    children {
      ...allDirectories
    }
  }

  # Recursive loading of files
  fragment allFiles on File {
    name
    children {
      ...allFiles
    }
  }


  type Auth {
    token: String
  }

  input SortingInput {
    field: String
    direction: String
  }

  type Mutation {
    login(username: String!, password: String!): Auth
    signup(username: String!, password: String!): Auth
    setAdminParams(name: String!, value: String): AdminParams
    setProfileParams(sorting: SortingInput): ProfileParams
    addNotification(customer: String, directory: String!, value: String): Notification
    updateNotification(id: ID!, customer: String, directory: String!, value: String): Notification
    deleteNotification(id: ID!): Notification
  }
`;

module.exports = typeDefs;
