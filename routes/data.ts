// @ts-check
import express from "express";
import graphqlHTTP from "express-graphql";

import { Route } from "./route";
import { db } from "../core/database";
import { errorFormatter } from "../schema/error-formatter";

export class DataRouter implements Route {

    constructor() {
    }

    route(): express.Router {

        const handler = express.Router();

        handler.use("", graphqlHTTP({
            schema: db.getGraphQLSchema(),
            graphiql: true,
            customFormatErrorFn: errorFormatter.format,
            rootValue: db.getGraphQLResolver()
        }))

        return handler;
    }
}