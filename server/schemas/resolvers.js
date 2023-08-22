const JWT = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = "test";

const {
  directoryTree,
  getFilesFromSelectedDirectory,
} = require("../utils/directoryTree");

//Temp const directory. Should be changed
const pathToRootDirectory = "C:\\testFolder";
const directories = directoryTree(pathToRootDirectory);

//Temp const directory. Should be changed
const pathToSelectedDirectory = "C:\\testFolder\\folder5\\files";
const files = getFilesFromSelectedDirectory(pathToSelectedDirectory);

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
    users: async () => {
      try {
        const users = await User.find();
        return users;
      } catch (error) {
        throw new Error("Error fetching users");
      }
    },
    getFiles: (parent, { directory }, context) => {
      // console.log("getFiles_Query: directory: ", directory);
      if (typeof directory !== "string") {
        throw new Error('The "directory" argument must be a string.');
      }
      const files = getFilesFromSelectedDirectory(directory);
      // console.log("getFiles_Query: files: ", files);
      return files;
    },
  },
  Mutation: {
    login: async (parent, { username, password }, context) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new AuthenticationError("Incorrect credentials");
        }
        const correctPassword = await user.isCorrectPassword(password);
        if (!correctPassword) {
          throw new AuthenticationError("Incorrect credentials");
        }
        const token = JWT.sign({ username, id: user.id }, JWT_SECRET, {
          expiresIn: "1d", // Expiration time
        });
        return { token };
      } catch (error) {
        throw new Error("An error occurred while logging in");
      }
    },
    addUser: async (parent, { username, password }, context) => {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error("User already exists");
      } else {
        const newUser = await User.create({ username, password });
        const token = JWT.sign({ username, id: newUser.id }, JWT_SECRET, {
          expiresIn: "1d", // Expiration time
        });
        return { token };
      }
    },
  },
};

module.exports = resolvers;
