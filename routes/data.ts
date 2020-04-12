// @ts-check
import express from "express";
import graphqlHTTP from "express-graphql";

import { Route } from "./route";
import { db } from "../core/database";
import { errorFormatter } from "../schema/error-formatter";
import { QueryModifier } from "../core/query-modifier";

export class DataRouter implements Route {

    constructor() {
    }

    route(): express.Router {

        const handler = express.Router();

        handler.use("", graphqlHTTP({
            schema: db.getGraphQLSchema(),
            graphiql: true,
            customFormatErrorFn: errorFormatter.format,
            rootValue: {
                insertUser: (args: any) => {
                    return db.getService("user").add(args.doc);
                },
                updateUser: (args: any) => {
                    return db.getService("user").update(args.doc);
                },
                getUser: (args: any) => {

                    let qm = new QueryModifier({ filterBy: `{ "_id": "${args._id}" }` });

                    return db.getService("user").find(qm);
                },
                findUsers: (args: any) => {
                    return db.getService("user").find(args.q);
                },
                deleteUser: (args: any) => {
                    return db.getService("user").delete(args._id);
                }
            }
        }))

        return handler;
    }
}