require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { authDirective } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas/index");
const db = require("./config/connection");
const { User, AdminParams } = require("./models");
const { GraphQLError } = require("graphql");
const JWT = require("jsonwebtoken");

const app = express();
const JWT_SECRET = "test";

const API_HOST = process.env.APP_API_HOST;
const API_SERVER_PORT = process.env.APP_API_SERVER_PORT;
const API_CLIENT_PORT = process.env.APP_API_CLIENT_PORT;


// CORS middleware (important for cookies & credentials)
const origin =
  API_CLIENT_PORT && API_CLIENT_PORT !== "80"
    ? `${API_HOST}:${API_CLIENT_PORT}`
    : API_HOST;

app.use(
  cors({
    origin,
    credentials: true,
  })
);
console.log("API_HOST:", process.env.APP_API_HOST);
console.log("API_SERVER_PORT:", process.env.APP_API_SERVER_PORT);
console.log("API_CLIENT_PORT:", process.env.APP_API_CLIENT_PORT);
// JSON body parser
app.use(bodyParser.json());

// Auth directive setup
const { authDirectiveTypeDefs, authDirectiveTransformer } =
  authDirective("auth");

let executableSchema = makeExecutableSchema({
  typeDefs: [authDirectiveTypeDefs, typeDefs],
  resolvers,
});
executableSchema = authDirectiveTransformer(executableSchema);

const server = new ApolloServer({
  schema: executableSchema,
  csrfPrevention: false,
});

(async () => {
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();

        if (token) {
          try {
            const decoded = JWT.verify(token, JWT_SECRET);
            const user = await User.findByPk(decoded.id);
            return { user };
          } catch (err) {
            console.error("Invalid token:", err.message);
            throw new GraphQLError("Invalid or expired token", {
              extensions: { code: "UNAUTHENTICATED" },
            });
          }
        }

        return { user: null };
      },
    })
  );

  // REST route for downloading files
  app.post("/download", async (req, res) => {
    try {
      const { pathToFile } = req.body;
      const paramNamePathToRootDir = "path-to-root-directory";
      const directoryParam = await AdminParams.findOne({
        name: paramNamePathToRootDir,
      });

      let fullPathToDirectory = directoryParam?.value;
      if (!pathToFile || !fullPathToDirectory) {
        console.log("Incorrect path to the file");
        const message = "Incorrect path to the file";
        throw new Error(message, {
          extensions: { code: "INCORRECT_PATH" },
        });
      }

      const resolvedPath = path.resolve(fullPathToDirectory, pathToFile);

      console.log("fullPathToDirectory: ", resolvedPath);

      res.sendFile(resolvedPath, (error) => {
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

  // Serve frontend from React build
  app.use(express.static(path.join(__dirname, "client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });

  db.once("open", () => {
    app.listen(API_SERVER_PORT, () => {
      console.log(`🚀 Server ready at ${API_HOST}:${API_SERVER_PORT}/graphql`);
    });
  });
})();
