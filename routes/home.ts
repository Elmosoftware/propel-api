// @ts-check
import express from "express";
import { Route } from "./route";

/**
 * API Home route. Returns the API home page.
 * @implements Route.
 */
export class HomeRouter implements Route {

    constructor() {
    }

    route(): express.Router {

        const handler = express.Router();

        handler.get("", (req, res) => {
            res.send("<h1>Propel API</h1><p><h2>Reach your servers!</h2></p>");
        });

        return handler;
    }
}
