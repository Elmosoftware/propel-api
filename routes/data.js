// @ts-check

const handler = require("express").Router();
const graphqlHTTP = require("express-graphql");

const db = require("../core/database")
const graphqlSchema = require("../schema/schema");
const ErrorFormater = require("../schema/error-formatter")

handler.use("", graphqlHTTP({
    schema: graphqlSchema,
    graphiql: true,
    customFormatErrorFn: ErrorFormater.format,
    rootValue: {
        insertUser: (args) => {
            return db.getService(args.doc.name).add(args.doc.doc);
        },
        updateUser: (args) => {
            return db.getService(args.doc.name).update(args.doc.doc);
        },
        getUser: (args) => {


            // =======================================================================
            throw new Error("FEATURE NOT IMPLEMENTED YET!!!");
            // =======================================================================


        },
        findUsers: (args) => {

            // =======================================================================
            throw new Error("FEATURE NOT IMPLEMENTED YET!!!");
            // =======================================================================

        }
    }
}))

module.exports = handler;