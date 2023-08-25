const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");

function authDirective(directiveName) {
  const typeDirectiveArgumentMaps = {};
  return {
    authDirectiveTypeDefs: `
  directive @${directiveName} on QUERY | FIELD_DEFINITION | FIELD
`,
    authDirectiveTransformer: (schema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          // console.log("type: ", type)
          const authDirective = getDirective(schema, type, directiveName)?.[0];
        //   console.log("authDirective1: ", authDirective);
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
        //   console.log("schema: ", schema);
          const authDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] ??
            typeDirectiveArgumentMaps[typeName];
          if (authDirective) {
            // console.log("schema: ", schema);
            // console.log("authDirective2: ", authDirective);
            const { resolve = defaultFieldResolver } = fieldConfig;
            fieldConfig.resolve = function (source, args, context, info) {
            //   console.log("context.user auth.js: ", context.user);
              if (context.user) {
                return resolve(source, args, context, info);
              }
              throw new Error("You need to be logged in.");
            };
            return fieldConfig;
          }
        },
      }),
  };
}

module.exports = { authDirective };
