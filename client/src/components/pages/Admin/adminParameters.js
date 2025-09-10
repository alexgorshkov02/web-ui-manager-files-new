// General parameters
const idPathToRootDirectory = "path-to-root-directory";
const labelPathToRootDirectory = "Path to root directory";

// Authentication parameters
const idAuthLdap = "auth-ldap";
const labelAuthLdap = "LDAP";
const idAuthLdapUseSSL = "auth-ldap-use-ssl";
const labelAuthLdapUseSSL = "SSL";
const idAuthLdapCertPath = "auth-ldap-cert-path";
const labelAuthLdapCertPath = "LDAP certificate path";
const idAuthLdapServer = "auth-ldap-server";
const labelAuthLdapServer = "Auth LDAP server IP address";
const idAuthLdapPort = "auth-ldap-port";
const labelAuthLdapPort = "Auth LDAP Port";
const idAuthBindDN = "auth-bind-dn";
const labelAuthBindDN = "Auth Bind DN";
const idAuthBindPassword = "auth-bind-password";
const labelAuthBindPassword = "Auth Bind password";
const idAuthBaseDN = "auth-base-dn";
const labelAuthBaseDN = "Auth Base DN";

// Folders parameters
const idLdap = "ldap";
const labelLdap = "LDAP";
const idLdapUseSSL = "ldap-use-ssl";
const labelLdapUseSSL = "SSL";
const idLdapCertPath = "ldap-cert-path";
const labelLdapCertPath = "LDAP certificate path";
const idLdapServer = "ldap-server";
const labelLdapServer = "LDAP server IP address";
const idLdapPort = "ldap-port";
const labelLdapPort = "LDAP port";
const idBindDN = "bind-dn";
const labelBindDN = "Bind DN";
const idBindPassword = "bind-password";
const labelBindPassword = "Bind password";
const idBaseDN = "base-dn";
const labelBaseDN = "Base DN";
const idScope = "scope";
const labelScope = "Scope (Search Options)";
const idFilter = "filter";
const labelFilter = "Filter (Search Options)";
const idAttribute = "attribute";
const labelAttribute = "Attribute (Search Options)";

// Types
const textType = "text";
const switchType = "switch";
const toggleType = "toggle";

// Group names
const authenticationGroup = "authentication";
const foldersGroup = "folders";

const parameters = {
  General: [
    {
      id: idPathToRootDirectory,
      label: labelPathToRootDirectory,
      type: textType,
    },
  ],
  Authentication: [
    { id: idAuthLdap, label: labelAuthLdap, type: toggleType },
    {
      id: idAuthLdapUseSSL,
      label: labelAuthLdapUseSSL,
      type: switchType,
      dependsOn: idAuthLdap,
    },
    {
      id: idAuthLdapCertPath,
      label: labelAuthLdapCertPath,
      type: textType,
      dependsOn: idAuthLdapUseSSL,
    },
    {
      id: idAuthLdapServer,
      label: labelAuthLdapServer,
      type: textType,
      dependsOn: idAuthLdap,
    },
    {
      id: idAuthLdapPort,
      label: labelAuthLdapPort,
      type: textType,
      dependsOn: idAuthLdap,
    },
    {
      id: idAuthBindDN,
      label: labelAuthBindDN,
      type: textType,
      dependsOn: idAuthLdap,
    },
    {
      id: idAuthBindPassword,
      label: labelAuthBindPassword,
      type: textType,
      dependsOn: idAuthLdap,
    },
    {
      id: idAuthBaseDN,
      label: labelAuthBaseDN,
      type: textType,
      dependsOn: idAuthLdap,
    },
  ],
  Folders: [
    { id: idLdap, label: labelLdap, type: toggleType },
    {
      id: idLdapUseSSL,
      label: labelLdapUseSSL,
      type: switchType,
      dependsOn: idLdap,
    },
    {
      id: idLdapCertPath,
      label: labelLdapCertPath,
      type: textType,
      dependsOn: idLdapUseSSL,
    },
    {
      id: idLdapServer,
      label: labelLdapServer,
      type: textType,
      dependsOn: idLdap,
    },
    {
      id: idLdapPort,
      label: labelLdapPort,
      type: textType,
      dependsOn: idLdap,
    },
    { id: idBindDN, label: labelBindDN, type: textType, dependsOn: idLdap },
    {
      id: idBindPassword,
      label: labelBindPassword,
      type: textType,
      dependsOn: idLdap,
    },
    { id: idBaseDN, label: labelBaseDN, type: textType, dependsOn: idLdap },
    { id: idScope, label: labelScope, type: textType, dependsOn: idLdap },
    { id: idFilter, label: labelFilter, type: textType, dependsOn: idLdap },
    {
      id: idAttribute,
      label: labelAttribute,
      type: textType,
      dependsOn: idLdap,
    },
  ],
};

export {
  parameters,
  idAuthLdap,
  idAuthLdapUseSSL,
  labelAuthLdapUseSSL,
  idAuthLdapCertPath,
  idAuthLdapServer,
  idAuthLdapPort,
  idAuthBindDN,
  idAuthBindPassword,
  idAuthBaseDN,
  idLdap,
  idLdapUseSSL,
  labelLdapUseSSL,
  idLdapCertPath,
  idLdapServer,
  idLdapPort,
  idBindDN,
  idBindPassword,
  idBaseDN,
  idScope,
  idFilter,
  idAttribute,
  switchType,
  toggleType,
  authenticationGroup,
  foldersGroup,
};