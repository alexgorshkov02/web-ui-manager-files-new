const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

const app = express();
const PORT = process.env.PORT || 3001;

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

// Serve static assets. Check later.
// app.use(express.static(path.join(__dirname, "../client/public")));
