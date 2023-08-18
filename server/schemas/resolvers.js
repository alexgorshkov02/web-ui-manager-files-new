const { User } = require("../models");

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

module.exports = resolvers;
