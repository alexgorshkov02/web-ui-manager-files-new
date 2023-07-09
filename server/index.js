const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const express = require("express");
const json = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const {directoryTree, getFiles} = require("./directoryTree");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Directory" type defines the queryable fields for every directory in our data source.
  type Directory {
    path: String
    name: String
    children: [Directory]
  }

  type File {
    name: String
    size: String
    ctime: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "directories" query returns an array of zero or more Directories (defined above).
  type Query {
    directories: Directory
    files: [File]
  }

  # Recursive loading of subfolders
  fragment allDirectories on Directory {
    name
    children {
      ...allDirectories
    }
  }
`;

const db = require("./config/connection");


//Temp const directory. Should be changed
const pathToRootDirectory = "C:\\testFolder";
const directories = directoryTree(pathToRootDirectory);

//Temp const directory. Should be changed
const pathToSelectedDirectory = "C:\\testFolder\\folder5\\files";
const files = getFiles(pathToSelectedDirectory);

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    directories: () => directories,
    files: () => files,
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
db.once("open", async () => {
  app.listen(PORT, async () => {
    await server.start();
    app.use("/graphql", cors(), json(), expressMiddleware(server));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/public/index.html"));
    });
    // console.log(`🚀  Server ready at: ${url}`);
  });
});