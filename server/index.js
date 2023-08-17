const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
// const json = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const {
  directoryTree,
  getFilesFromSelectedDirectory,
} = require("./directoryTree");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

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

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "directories" query returns an array of zero or more Directories (defined above).
  type Query {
    directories: Directory
    files(directory: String): [File]
  }

  # Recursive loading of subfolders
  fragment allDirectories on Directory {
    name
    children {
      ...allDirectories
    }
  }

  type Mutation {
    getFiles(directory: String): [File]
  }
`;

const db = require("./config/connection");

//Temp const directory. Should be changed
const pathToRootDirectory = "C:\\testFolder";
const directories = directoryTree(pathToRootDirectory);

//Temp const directory. Should be changed
const pathToSelectedDirectory = "C:\\testFolder\\folder5\\files";
const files = getFilesFromSelectedDirectory(pathToSelectedDirectory);

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    directories: () => directories,
    files: (parent, { directory }, context) => {
      console.log("files_Query: directory: ", directory);

      if (typeof directory !== "string") {
        throw new Error('The "directory" argument must be a string.');
      }
      const files = getFilesFromSelectedDirectory(directory);
      return files;
    },
  },
  Mutation: {
    getFiles: (parent, { directory }, context) => {
      console.log("getFiles_Mutation: directory: ", directory);
      if (typeof directory !== "string") {
        throw new Error('The "directory" argument must be a string.');
      }
      const files = getFilesFromSelectedDirectory(directory);
      return files;
    },
  },
};

// Serve static assets. Check later.
// app.use(express.static(path.join(__dirname, "../client/public")));

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
    app.use(bodyParser.json());
    app.use("/graphql", cors(), expressMiddleware(server));
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      next();
    });

    app.post("/download", async (req, res) => {
      try {
        // console.log("path_SERVER: ", req.body);
        const { pathToFile } = req.body; // Extract the 'path' property from the request body
        console.log("path_SERVER: ", pathToFile);

        res.sendFile(pathToFile, (error) => {
          if (error) {
            console.error("Error sending file:", error.message);
            res.status(500).send("Internal Server Error");
          } else {
            console.log("File sent successfully");
          }
        });
      } catch (error) {
        console.error("Error downloading file from the REST API:", error);
        res.status(500).json({ error: "Failed to download file" }); // Handle error
      }
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/public/index.html"));
    });
    // console.log(`🚀  Server ready at: ${url}`);
  });
});
