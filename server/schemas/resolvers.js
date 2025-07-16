const fs = require("fs");
const JWT = require("jsonwebtoken");
const { User, AdminParams, ProfileParams, Notification } = require("../models");
const ldap = require("ldapjs");
const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set in environment variables!");
  process.exit(1); //stop app if secret is not set
}

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

const getClientOptions = (useSSL, ldapCertPath, ldapServer, ldapPort) => {
  if (useSSL && !ldapCertPath) {
    throw new Error("SSL is enabled but no certificate path is provided");
  }

  const clientOptions = {
    url: `${useSSL ? "ldaps" : "ldap"}://${ldapServer}:${ldapPort}`,
  };

  if (useSSL) {
    const certPath = path.join(process.cwd(), ldapCertPath);
    clientOptions.tlsOptions = {
      ca: [fs.readFileSync(certPath)],
    };
  }

  return clientOptions;
};

async function authenticateUser(username, password) {
  const authParamNames = [
    "auth-ldap-use-ssl",
    "auth-ldap-cert-path",
    "auth-ldap-server",
    "auth-ldap-port",
    "auth-bind-dn",
    "auth-bind-password",
    "auth-base-dn",
  ];

  const authParams = await AdminParams.find({
    name: { $in: authParamNames },
  });

  const authParamMap = {};
  authParams.forEach((param) => {
    authParamMap[param.name] = param.value;
  });

  const paramAuthUseSSL = authParamMap["auth-ldap-use-ssl"] === "true";
  const paramAuthLdapCertPath = authParamMap["auth-ldap-cert-path"];
  const paramAuthLdapServer = authParamMap["auth-ldap-server"];
  const paramAuthLdapPort = authParamMap["auth-ldap-port"];
  const paramAuthLdapBindDN = authParamMap["auth-bind-dn"];
  const paramAuthLdapBindPassword = authParamMap["auth-bind-password"];
  const paramAuthLdapBaseDN = authParamMap["auth-base-dn"];
  console.log("LDAP Base DN:", paramAuthLdapBaseDN);

  const clientOptions = getClientOptions(
    paramAuthUseSSL,
    paramAuthLdapCertPath,
    paramAuthLdapServer,
    paramAuthLdapPort
  );
  const client = ldap.createClient(clientOptions);

  // Error handler to avoid crash
  client.on("error", (err) => {
    console.error("LDAP client error (authenticateUser):", err.message || err);
  });

  try {
    // First bind using service account (bind DN)
    await new Promise((resolve, reject) => {
      client.bind(paramAuthLdapBindDN, paramAuthLdapBindPassword, (err) => {
        if (err) {
          console.error("LDAP service bind error:", err);
          return reject(new Error("LDAP bind failed with service credentials"));
        }
        resolve();
      });
    });

    const searchOptions = {
      filter: `(uid=${username})`,
      scope: "sub",
      attributes: ["dn"],
    };

    const userDN = await new Promise((resolve, reject) => {
      client.search(paramAuthLdapBaseDN, searchOptions, (err, res) => {
        if (err) {
          console.error("LDAP search init error:", err);
          return reject(err);
        }

        let foundDN = null;

        res.on("searchEntry", (entry) => {
          foundDN = entry.objectName || entry.dn || entry.object?.dn;
        });

        res.on("error", (err) => {
          console.error("LDAP search response error:", err);
          reject(err);
        });

        res.on("end", () => {
          if (foundDN) {
            resolve(foundDN);
          } else {
            reject(new Error("User DN not found"));
          }
        });
      });
    });

    console.log("Found user DN:", userDN);

    const userDnString = userDN.toString();

    // Bind as user with given password to check credentials
    await new Promise((resolve, reject) => {
      client.bind(userDnString, password, (err) => {
        if (err) {
          console.error("LDAP bind error:", err);
          reject(new Error("Invalid credentials"));
        } else {
          resolve();
        }
      });
    });

    console.log("User authenticated successfully");
    return true;
  } catch (err) {
    console.error("Error during authentication:", err.message || err);
    return false;
  } finally {
    client.unbind((unbindErr) => {
      if (unbindErr) {
        console.error("Error during LDAP unbind:", unbindErr);
      }
    });
  }
}

// const getAccessFolders = async () => ["subdir1", "subdir2"];

async function getAccessFolders(username) {
  const paramNames = [
    "ldap-use-ssl",
    "ldap-cert-path",
    "ldap-server",
    "ldap-port",
    "bind-dn",
    "bind-password",
    "base-dn",
    "scope",
    "filter",
    "attribute",
  ];

  const params = await AdminParams.find({
    name: { $in: paramNames },
  });

  const paramMap = {};
  params.forEach((param) => {
    paramMap[param.name] = param.value;
  });

  console.log("LDAP Params:", paramMap);

  const paramUseSSL = paramMap["ldap-use-ssl"] === "true";
  const paramLdapCertPath = paramMap["ldap-cert-path"];
  const paramLdapServer = paramMap["ldap-server"];
  const paramLdapPort = paramMap["ldap-port"];
  const paramLdapBindDN = paramMap["bind-dn"];
  const paramLdapBindPassword = paramMap["bind-password"];
  const paramLdapBaseDN = paramMap["base-dn"];
  const paramScope = paramMap["scope"];
  const paramFilter = paramMap["filter"];
  const paramAttribute = paramMap["attribute"];

  const attributes = ["cn", paramAttribute.trim()];
  const accessFolders = [];

  console.log("LDAP Base DN:", paramLdapBaseDN);
  console.log("LDAP Scope:", paramScope);
  console.log("LDAP Filter:", paramFilter);
  console.log("LDAP Attribute:", paramAttribute);

  const clientOptions = getClientOptions(
    paramUseSSL,
    paramLdapCertPath,
    paramLdapServer,
    paramLdapPort
  );
  const client = ldap.createClient(clientOptions);

  // Error handler to avoid crash
  client.on("error", (err) => {
    console.error("LDAP client error (authenticateUser):", err.message || err);
  });

  try {
    // Bind to LDAP with service account
    await new Promise((resolve, reject) => {
      client.bind(paramLdapBindDN, paramLdapBindPassword, (err) => {
        if (err) {
          console.error("LDAP bind error (getAccessFolders):", err);
          reject(new Error("Error binding to the LDAP server"));
        } else {
          console.log("LDAP bind successful");
          resolve();
        }
      });
    });

    // Look for user in groups for files
    const searchOptions = {
      scope: paramScope,
      filter: paramFilter,
      attributes: attributes,
    };

    console.log("LDAP search options:", searchOptions);

    await new Promise((resolve, reject) => {
      client.search(paramLdapBaseDN, searchOptions, (err, res) => {
        if (err) {
          console.error("LDAP search init error (getAccessFolders):", err);
          return reject(new Error("LDAP search error"));
        }

        res.on("searchEntry", (entry) => {
          console.log("LDAP searchEntry received:", entry.objectName);

          if (entry.attributes) {
            const cnAttr = entry.attributes.find((attr) => attr.type === "cn");
            const memberAttr = entry.attributes.find(
              (attr) => attr.type === paramAttribute
            );

            console.log("Entry CN:", cnAttr?.values);
            console.log("Entry member values:", memberAttr?.values);

            const isUserMember = memberAttr?.values?.some((dn) => {
              // Extract uid from DN string like "uid=user,ou=users,dc=example,dc=org"
              const match = dn.match(/^uid=([^,]+)/i);
              const uid = match ? match[1] : null;
              return uid && uid.toLowerCase() === username.toLowerCase();
            });

            if (isUserMember && cnAttr?.values) {
              console.log(`User ${username} is a member of`, cnAttr.values);
              accessFolders.push(...cnAttr.values);
            }
          }
        });

        res.on("error", (err) => {
          console.error("LDAP search response error (getAccessFolders):", err);
          reject(err);
        });

        res.on("end", () => {
          console.log("LDAP search completed");
          resolve();
        });
      });
    });

    console.log("Access folders found:", accessFolders);
    return accessFolders;
  } catch (err) {
    console.error("Error in getAccessFolders:", err.message || err);
    return [];
  } finally {
    client.unbind((unbindErr) => {
      if (unbindErr) {
        console.error(
          "Error during LDAP unbind (getAccessFolders):",
          unbindErr
        );
      }
    });
  }
}
const resolvers = {
  Query: {
    // directories: () => directories,
    directories: async (parent, args, context) => {
      // return null;
      if (!context.user) return null;

      const paramLdapEnabled = "ldap";
      const ldapEnabled = await AdminParams.findOne({
        name: paramLdapEnabled,
      });
      // console.log("ldapEnabled:", typeof ldapEnabled.value, ldapEnabled.value);
      // console.log("context.user:", context.user.username);

      //TODO: Change to boolean and switcher
      if (ldapEnabled && ldapEnabled.value === "true") {
        // console.log("TEST");
        const folders = await getAccessFolders(context.user.username);
        // console.log('Access folders:', folders);

        console.log("folders.length > 0: ", folders?.length > 0);
        if (folders && folders.length > 0) {
          const paramNamePathToRootDir = "path-to-root-directory";
          const directoryParam = await AdminParams.findOne({
            name: paramNamePathToRootDir,
          });

          if (
            directoryParam?.value === "/" ||
            directoryParam?.value === "C:/"
          ) {
            console.warn("Refusing to scan root directory.");
            return null;
          }

          // console.log(directoryParam);
          if (directoryParam) {
            // console.log("directoryfromDB.value: ", directoryParam.value);
            console.log("Path to directoryTree:", directoryParam.value);
            const resolvedPath = path.resolve(directoryParam.value);

            try {
              const directories = directoryTree(resolvedPath);
              // console.log("directories.children: ", directories.children);
              // console.log('Access folders:', folders[0]);
              // console.log("directories: ", directories.children[0].name);
              directories.children = directories.children.filter((child) =>
                folders.includes(child.name)
              );
              // console.log("directories: ", directories);
              return directories;
            } catch (error) {
              console.error("Error building directory tree:", error);
              return null;
            }
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        const paramNamePathToRootDir = "path-to-root-directory";
        const directoryParam = await AdminParams.findOne({
          name: paramNamePathToRootDir,
        });

        if (directoryParam?.value === "/" || directoryParam?.value === "C:/") {
          console.warn("Refusing to scan root directory.");
          return null;
        }

        // console.log(directoryParam);
        if (directoryParam) {
          // console.log("directoryfromDB.value: ", directoryParam.value);
          console.log("Path to directoryTree:", directoryParam.value);
          const resolvedPath = path.resolve(directoryParam.value);
          try {
            const directories = directoryTree(resolvedPath);
            // console.log("directories.children: ", directories.children);
            // console.log('Access folders:', folders[0]);
            // console.log("directories: ", directories.children[0].name);
            // console.log("directories: ", directories);
            return directories;
          } catch (error) {
            console.error("Error building directory tree:", error);
            return null;
          }
        } else {
          return null;
        }
      }
    },
    files: async (parent, { directory }, context) => {
      // return null;
      if (directory === undefined || directory === null) {
        console.warn("No directory provided, using root fallback");
        // Proceed with root folder loading logic
      }

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
      // console.log("directoryParam: ", directoryParam);
      if (directoryParam) {
        let fullPathToDirectory = directoryParam.value;
        console.log("fullPathToDirectory:", fullPathToDirectory);

        if (directory && directory.length !== 0) {
          // console.log("directory: ", directory);
          fullPathToDirectory = path.join(fullPathToDirectory, directory);
          // console.log("directory: ", directory);
          // const fullPathToDirectory = directoryParam.value + "\\\\" + directory;
          // console.log("fullPathToDirectory: ", fullPathToDirectory);

          try {
            const files = getFilesFromSelectedDirectory(
              directoryParam.value,
              fullPathToDirectory,
              directory
            );

            if (!files) {
              // Optionally log and return a structured error or null
              console.warn("Directory path invalid or unreadable");
              return null;
            } else {
              console.log("files: ", files);
              return files;
            }
          } catch (err) {
            console.error("getting files failed:", err);
            return null;
          }
        } else {
          const paramLdapEnabled = "ldap";
          const ldapEnabled = await AdminParams.findOne({
            name: paramLdapEnabled,
          });
          // console.log("ldapEnabled:", typeof ldapEnabled.value, ldapEnabled.value);

          //TODO: Change to boolean and switcher
          if (ldapEnabled && ldapEnabled.value === "true") {
            const folders = await getAccessFolders(context.user.username);

            const files = getFilesFromSelectedDirectory(
              directoryParam.value,
              fullPathToDirectory,
              directory
            );

            if (!files) {
              // Optionally log and return a structured error or null
              console.warn("Directory path invalid or unreadable:");
              return null;
            } else {
              // console.log("files: ", files);
              // const directories = directoryTree(fullPathToDirectory);
              files.children = files.children.filter((child) =>
                folders.includes(child.name)
              );
              return files;
            }
          } else {
            try {
              const files = getFilesFromSelectedDirectory(
                directoryParam.value,
                fullPathToDirectory,
                directory
              );

              if (!files) {
                // Optionally log and return a structured error or null
                console.warn("Directory path invalid or unreadable");
                return null;
              } else {
                console.log("files: ", files);
                return files;
              }
            } catch (err) {
              console.error("getting files failed:", err);
              return null;
            }
          }
        }
      } else {
        return null;
      }
    },

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
    getProfileParams: async (root, args, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      try {
        console.log("context.user.id: ", context.user.id);
        const params = await ProfileParams.findOne({ userId: context.user.id });
        console.log("params: ", params);
        return params;
      } catch (error) {
        console.error("Error in getProfileParams resolver:", error);
        throw new Error("Failed to fetch profile params");
      }
    },
    getNotifications: async () => {
      try {
        console.log("Received request for getNotifications");
        const notifications = await Notification.find();
        const sortedNotifications = sortByDirectories(notifications);
        console.log("Sending notifications:", sortedNotifications);
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
        const paramAuthLdapEnabled = "auth-ldap";
        const authLdapEnabled = await AdminParams.findOne({
          name: paramAuthLdapEnabled,
        });
        // console.log("ldapEnabled:", typeof ldapEnabled.value, ldapEnabled.value);

        //TODO: Change to boolean and switcher
        if (authLdapEnabled && authLdapEnabled.value === "true") {
          let authenticatedUser = await authenticateUser(username, password);
          // console.log("authenticatedUser: ", authenticatedUser);
          if (authenticatedUser) {
            let localUser = await User.findOne({ username });
            if (!localUser) {
              localUser = await User.create({
                username,
                authType: "ldap",
                lastLogin: new Date(),
              });
              console.log(`Created new local user: ${username}`);
            } else {
              localUser.lastLogin = new Date();
              await localUser.save();
              console.log(`Updated last login for user: ${username}`);
            }

            const token = JWT.sign({ username, id: localUser.id }, JWT_SECRET, {
              expiresIn: "1d", // Expiration time
            });

            // console.log("Token: ", token);
            return { token };
          } else {
            return null;
          }
        } else {
          const user = await User.findOne({ username }).select("+password");
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
        }
      } catch (error) {
        console.error("Login error details:", error);
        throw new Error("An error occurred while logging in");
      }
    },
    signup: async (parent, { username, password }, context) => {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error("User already exists");
      } else {
        const newUser = await User.create({
          username,
          password,
          authType: "local",
          lastLogin: new Date(),
        });
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
    setProfileParams: async (parent, { sorting }, context) => {
      try {
        if (!context.user) {
          throw new Error("Not authenticated");
        }

        const { field, direction } = sorting ?? {};

        // Allowed values
        const validFields = ["name", "size", "ctime"];
        const validDirections = ["asc", "desc"];

        // Validate sorting.field
        if (field && !validFields.includes(field)) {
          throw new Error(
            `Invalid sorting field. Allowed: ${validFields.join(", ")}`
          );
        }

        // Validate sorting.direction
        if (direction && !validDirections.includes(direction)) {
          throw new Error(`Invalid sorting direction. Allowed: asc, desc`);
        }

        const query = { userId: context.user.id };
        const isReset = !field && !direction;

        if (isReset) {
          await ProfileParams.updateOne(query, {
            $unset: {
              "sorting.field": "",
              "sorting.direction": "",
            },
          });
        } else {
          const params = {};
          if (field) params["sorting.field"] = field;
          if (direction) params["sorting.direction"] = direction;

          await ProfileParams.updateOne(
            query,
            { $set: params },
            { upsert: true } // creates the record if it doesn't exist
          );
        }

        return await ProfileParams.findOne(query);
      } catch (error) {
        console.error("SetProfileParams error details:", error);
        throw new Error("An error occurred while setting profile parameters");
      }
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
