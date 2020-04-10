// @ts-check

const handler = require("express").Router();
const graphqlHTTP = require("express-graphql");

const db = require("../core/database")
const ErrorFormater = require("../schema/error-formatter");
const QueryModifier = require("../core/query-modifier")

handler.use("", graphqlHTTP({
    schema: db.getGraphQLSchema(),
    graphiql: true,
    customFormatErrorFn: ErrorFormater.format,
    rootValue: {
        insertUser: (args) => {
            return db.getService("user").add(args.doc);
        },
        updateUser: (args) => {
            return db.getService("user").update(args.doc);
        },
        getUser: (args) => {

            let qm = new QueryModifier( { filterBy: `{ "_id": "${args._id}" }` });

            return db.getService("user").find(qm);
        },
        findUsers: (args) => {
            return db.getService("user").find(args.q);
        },
        deleteUser: (args) => {
            return db.getService("user").delete(args._id);   
        }
    }
}))

module.exports = handler;