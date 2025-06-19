require("dotenv").config();
const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");
const mime = require("mime-types");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const path = require("path");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { authDirective } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas/index");
const db = require("./config/connection");
const { User, AdminParams } = require("./models");
const { GraphQLError } = require("graphql");
const JWT = require("jsonwebtoken");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set in environment variables!");
  process.exit(1);  //stop app if secret is not set
}

// === Configuration ===
const NODE_ENV = process.env.NODE_ENV || "development";
const PROTOCOL = NODE_ENV === "production" ? "https" : "http";
const API_HOST = process.env.APP_API_HOST || "localhost";
const API_SERVER_PORT = process.env.APP_API_SERVER_PORT || "3001";
const API_CLIENT_PORT = process.env.APP_API_CLIENT_PORT || "3000";

// Build client origin URI for CORS with optional port
const isDefaultClientPort =
  (PROTOCOL === "http" && API_CLIENT_PORT === "80") ||
  (PROTOCOL === "https" && API_CLIENT_PORT === "443");

const clientPortSegment = !isDefaultClientPort ? `:${API_CLIENT_PORT}` : "";
const origin = `${PROTOCOL}://${API_HOST}${clientPortSegment}`;

console.log("API_HOST:", API_HOST);
console.log("API_SERVER_PORT:", API_SERVER_PORT);
console.log("API_CLIENT_PORT:", API_CLIENT_PORT);
console.log("Allowed CORS origin:", origin);

app.use(
  cors({
    origin,
    credentials: true,
  })
);

// Handle OPTIONS preflight requests for all routes
app.options("*", cors());

app.use(express.json());

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

      // Get content type based on extension only
      const extMime = mime.lookup(resolvedPath) || "application/octet-stream";

      // Set Content-Type header explicitly
      res.setHeader("Content-Type", extMime);

      res.sendFile(resolvedPath, (error) => {
        if (error) {
          console.error("Error sending file:", error.message);
          res.status(500).send("Internal Server Error");
        } else {
          console.log("File sent successfully with Content-Type:", extMime);
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
    if (NODE_ENV === "production") {
      const sslOptions = {
        key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
        cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
      };

      https.createServer(sslOptions, app).listen(API_SERVER_PORT, () => {
        console.log(
          `Server running at https://${API_HOST}:${API_SERVER_PORT}/graphql`
        );
      });

      // Skip redirect for OPTIONS to allow CORS preflight to work
      http
        .createServer((req, res) => {
          if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
            return;
          }

          const newHost = req.headers.host.replace(
            /:\d+/,
            `:${API_SERVER_PORT}`
          );
          res.writeHead(301, {
            Location: `https://${newHost}${req.url}`,
          });
          res.end();
        })
        .listen(80, () => {
          console.log(
            `HTTP redirector running on http://${API_HOST}:80 -> https://${API_HOST}:${API_SERVER_PORT}`
          );
        });
    } else {
      app.listen(API_SERVER_PORT, () => {
        console.log(
          `Server running at http://${API_HOST}:${API_SERVER_PORT}/graphql`
        );
      });
    }
  });
})();
