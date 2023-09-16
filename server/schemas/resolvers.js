const JWT = require("jsonwebtoken");
const { User, AdminParams, Notification } = require("../models");
const JWT_SECRET = "test";

const {
  directoryTree,
  getFilesFromSelectedDirectory,
} = require("../utils/directoryTree");

const sortByDirectories = (notifications) => {
  const sortedNotifications = [...notifications];

  sortedNotifications.sort((a, b) => {
    const directoryA = a.directory.toLowerCase();
    const directoryB = b.directory.toLowerCase();
    if (directoryA < directoryB) return -1;
    if (directoryA > directoryB) return 1;
    return 0;
  });

  return sortedNotifications;
};

const resolvers = {
  Query: {
    // directories: () => directories,
    directories: async (parent, args, context) => {
      const paramNamePathToRootDir = "path-to-root-directory";
      const directoryParam = await AdminParams.findOne({
        name: paramNamePathToRootDir,
      });
      // console.log(directoryfromDB);
      if (directoryParam) {
        // console.log("directoryfromDB.value: ", directoryfromDB.value);
        const directories = directoryTree(directoryParam.value);
        // console.log("directories: ", directories);
        return directories;
      } else {
        return null;
      }
    },
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
    getFiles: async (parent, { directory }, context) => {
      // console.log("context.user in getFiles resolver: ", contextValue.user);
      // In this case, we'll pretend there is no data when
      // we're not logged in. Another option would be to
      // throw an error.
      if (!context.user) return null;

      if (typeof directory !== "string") {
        throw new Error('The "directory" argument must be a string.');
      }

      if (directory.length !== 0) {
        const paramNamePathToRootDir = "path-to-root-directory";
        const directoryParam = await AdminParams.findOne({
          name: paramNamePathToRootDir,
        });
        if (directoryParam) {
          // console.log("directory: ", directory);
          const fullPathToDirectory = directoryParam.value + "\\\\" + directory;
          // console.log("fullDirectory: ", fullDirectory);
          const files = getFilesFromSelectedDirectory(fullPathToDirectory);
          return files;
        } else {
          return null;
        }
      } else return null;
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
    getNotifications: async () => {
      try {
        const notifications = await Notification.find();
        const sortedNotifications = sortByDirectories(notifications);
        return sortedNotifications;
      } catch (error) {
        throw new Error("Error fetching notifications");
      }
    },
    getNotification: async (parent, { directory }, context) => {
      console.log("directory: ", directory);
      if (typeof directory !== "string") {
        throw new Error('The "directory" argument must be a string.');
      }

      if (directory.length !== 0) {
        const value = await Notification.findOne({
          directory,
        });
        if (value) {
          console.log("value: ", value);

          return value;
        } else {
          return null;
        }
      } else return null;
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
        console.log("name: ", name, "value: ", value);
        await AdminParams.create({ name, value });
      }
      return null;
    },

    addOrUpdateNotification: async (
      parent,
      { id, customer, directory, value },
      context
    ) => {
      if (id) {
        const existingDirectory = await Notification.findOne({ _id: id });
        // console.log("existingDirectory: ", existingDirectory);
        if (existingDirectory) {
          if (existingDirectory._id !== id) {
            await Notification.updateOne(
              { _id: id },
              { $set: { customer, directory, value } }
            );
          } else {
            console.log(
              "Found duplicate directory. Change the existing directory"
            );
          }
        }
      } else {
        // console.log("directory: ", directory, "value: ", value);
        await Notification.create({ customer, directory, value });
      }
      return null;
    },

    deleteNotification: async (parent, { id }, context) => {
      console.log("id: ", id);
      const result = await Notification.deleteOne({ _id: id });

      if (result.deletedCount === 1) {
        console.log("Directory deleted successfully");
      } else {
        console.log("Directory not found or not deleted");
      }
      return null;
    },
  },
};

module.exports = resolvers;
