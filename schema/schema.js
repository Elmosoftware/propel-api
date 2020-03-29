const fs = require("fs");
const path = require("path");
const { buildSchema } = require("graphql");
let schemaDefinition = ""

// schemaDefinition =  fs.readFileSync(path.join(__dirname, "schema.graphql", "utf8")).toString();;
schemaDefinition =  fs.readFileSync(path.join(__dirname, "schema.graphql"), 
    {encoding: "utf8"}).toString();;

module.exports = buildSchema(schemaDefinition);
