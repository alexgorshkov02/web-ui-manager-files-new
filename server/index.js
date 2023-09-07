const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { authDirective } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas/index");
const db = require("./config/connection");
const { User } = require("./models");
const { GraphQLError } = require("graphql");
// const { printSchema } = require("graphql/utilities");

const JWT = require("jsonwebtoken");
const JWT_SECRET = "test";

const app = express();
const PORT = process.env.PORT || 3001;

// Generate the authDirective configuration
const { authDirectiveTypeDefs, authDirectiveTransformer } =
  authDirective("auth");

// Create the executable schema
let executableSchema = makeExecutableSchema({
  typeDefs: [authDirectiveTypeDefs, typeDefs],
  resolvers,
});

// Apply the authDirectiveTransformer to the schema
executableSchema = authDirectiveTransformer(executableSchema);
// console.log(printSchema(executableSchema))

db.once("open", async () => {
  const server = new ApolloServer({
    schema: executableSchema,
  });

  // Start the Apollo Server using startStandaloneServer
  const { url } = await startStandaloneServer(server);

  console.log(`Server ready at ${url}`);

  app.use(bodyParser.json());
  app.use(
    "/graphql",
    cors(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authorization = req.headers.authorization;
        // console.log("authorization: ", authorization);
        if (typeof authorization !== typeof undefined) {
          const search = "Bearer";
          const regEx = new RegExp(search, "ig");
          const token = authorization.replace(regEx, "").trim();

          try {
            const decodedToken = JWT.verify(token, JWT_SECRET);
            // console.log("decodedToken: ", decodedToken);
            if (decodedToken) {
              const user = await User.findByPk(decodedToken.id);
              // console.log("user (server): ", user);
              if (user) {
                // Return the user in the context object
                return Object.assign({}, req, { user });
              }
            }
          } catch (err) {
            // Handle token verification or user fetching errors
            console.error("Error verifying token:", err);
            throw new GraphQLError("Invalid or expired token", {
              extensions: {
                code: "UNAUTHENTICATED",
              },
            });
          }
        }
        // Default context object when there's no valid token or user
        return { user: null };
      },
    })
  );

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  app.post("/download", async (req, res) => {
    try {
      const { pathToFile } = req.body;
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
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/public/index.html"));
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server listening at: ${url}`);
  });
});
