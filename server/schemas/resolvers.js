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
      // console.log(directoryParam);
      if (directoryParam) {
        // console.log("directoryfromDB.value: ", directoryParam.value);
        const directories = directoryTree(directoryParam.value);
        // console.log("directories.children: ", directories.children);
        return directories;
      } else {
        return null;
      }
    },
    files: async (parent, { directory }, context) => {
      console.log("directory in getFiles resolver : ", directory);
      // In this case, we'll pretend there is no data when
      // we're not logged in. Another option would be to
      // throw an error.
      if (!context.user) return null;

      // if (typeof directory !== "string") {
      //   throw new Error('The "directory" argument must be a string.');
      // }

      const paramNamePathToRootDir = "path-to-root-directory";
      const directoryParam = await AdminParams.findOne({
        name: paramNamePathToRootDir,
      });

      if (directoryParam) {
        let fullPathToDirectory = directoryParam.value

        if (directory) {

          console.log("directory: ", directory);
          fullPathToDirectory = fullPathToDirectory + "\\\\" + directory;
        }  

        // console.log("directory: ", directory);
        // const fullPathToDirectory = directoryParam.value + "\\\\" + directory;
        // console.log("fullPathToDirectory: ", fullPathToDirectory);
        const files = getFilesFromSelectedDirectory(directoryParam.value, fullPathToDirectory, directory);
        // console.log("files: ", files);
        return files.children;
      } else {
        return null;
      }
    },

    // files: async (parent, { directory }, context) => {
    //   console.log("files_Query: directory: ", directory);
    //   const paramNamePathToRootDir = "path-to-root-directory";
    //   const directoryParam = await AdminParams.findOne({
    //     name: paramNamePathToRootDir,
    //   });
    //   // console.log(directoryfromDB);
    //   if (directoryParam) {
    //     // console.log("directoryfromDB.value: ", directoryfromDB.value);
    //     if (typeof directory !== "string") {
    //       throw new Error('The "directory" argument must be a string.');
    //     }

    //     const path = directoryParam.value + directory;

    //     // console.log("directories: ", directories);
    //     const files = getFilesFromSelectedDirectory(path);
    //     console.log("files: ", files);
    //     return files;
    //   } else {
    //     return null;
    //   }
    // },
    users: async () => {
      try {
        const users = await User.find();
        return users;
      } catch (error) {
        throw new Error("Error fetching users");
      }
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
      // console.log("directory: ", directory);
      // if (typeof directory !== "string") {
      //   throw new Error('The "directory" argument must be a string.');
      // }

      if (directory?.length !== 0) {
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

    addNotification: async (
      parent,
      { customer, directory, value },
      context
    ) => {
      const existingDirectory = await Notification.findOne({ directory });
      console.log("existingDirectory: ", existingDirectory);

      if (!existingDirectory) {
        await Notification.create({ customer, directory, value });
      } else {
        console.log("Found duplicate directory. Change the existing directory");
        const message =
          "Duplicate folder has been found. Please change a notification for the existing folder";
        throw new Error(message, {
          extensions: { code: "DUPLICATE_ENTITY" },
        });
      }

      return null;
    },

    updateNotification: async (
      parent,
      { id, customer, directory, value },
      context
    ) => {
      const existingNotification = await Notification.findOne({ _id: id });
      console.log("existingNotification: ", existingNotification);

      if (existingNotification) {
        await Notification.updateOne(
          { _id: id },
          { $set: { customer, directory, value } }
        );
      } else {
        console.log("Notification has not been found");
        const message = "Notification has not been found. It was not updated";
        throw new Error(message, {
          extensions: { code: "NO_ENTITY_FOUND" },
        });
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
