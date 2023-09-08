const JWT = require("jsonwebtoken");
const { User, AdminParams } = require("../models");
const JWT_SECRET = "test";

const {
  directoryTree,
  getFilesFromSelectedDirectory,
} = require("../utils/directoryTree");

//Temp const directory. Should be changed
const pathToRootDirectory = "C:\\testFolder";
const directories = directoryTree(pathToRootDirectory);

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
      // console.log("context.user in getFiles resolver: ", contextValue.user);
      // In this case, we'll pretend there is no data when
      // we're not logged in. Another option would be to
      // throw an error.
      if (!context.user) return null;

      if (typeof directory !== "string") {
        throw new Error('The "directory" argument must be a string.');
      }
      const files = getFilesFromSelectedDirectory(directory);
      // console.log("getFiles_Query: files: ", files);
      return files;
    },
    currentUser(root, args, context) {
      return context.user;
    },
    getAdminParams: async () => {
      try {
        const adminParams = await AdminParams.find();
        return adminParams;
      } catch (error) {
        throw new Error("Error fetching admin params");
      }
    },
  },
  Mutation: {
    login: async (parent, { username, password }, context) => {
      // console.log("context.user in login resolver:", context);
      try {
        const user = await User.findOne({ username });
        console.log("user in login resolver: ", user);
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
    signup: async (parent, { username, password }, context) => {
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
    setAdminParams: async (parent, { name, value }, context) => {
      const existingEntity = await AdminParams.findOne({ name: name });
      if (existingEntity) {
        await AdminParams.updateOne({ name }, { $set: { value } });
      } else {
        console.log("name: ", name, "value: ", value)
        await AdminParams.create({ name, value });
      }
      return null;
    },
  },
};

module.exports = resolvers;
