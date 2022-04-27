// @ts-check
import express from "express";
import { logger } from "../services/logger-service";
import { Route } from "../core/route";
import { SecurityRule } from "../core/security-rule";

/**
 * API Home route. Returns the API home page.
 * @implements Route.
 */
export class HomeRoute implements Route {

    name: string = "Home";

    path: string = "/api/home";

    security: SecurityRule[] = [];

    constructor() {
        logger.logDebug(`Creating route ${this.name} with path "${this.path}"`)
    }

    handler(): express.Router {

        const handler = express.Router();

        handler.get("", (req, res) => {
            res.send("<h1>Propel API</h1><p><h2>Reach your servers!</h2></p>");
        });

        return handler;
    }
}
