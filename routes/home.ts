// @ts-check
import express from "express";
import { Route } from "./route";

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
