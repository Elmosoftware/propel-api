// @ts-check

//Node libraries
import { promisify } from "util";

//Express App & Middlewares dependencies:
import express from "express";
import bodyParser from "body-parser";

//Core Propel API services and helpers:
import { cfg } from "./config";
import { Router } from "./router";

/**
 * Express JS based Web Server
 */
class WebServer {

    public app: any;
    public router: Router;

    constructor() {
        this.app = express();
        this.router = new Router(this.app);
    }

    start() {
        //Setting up Middlewares:
        this.app.use(bodyParser.json()); // to support JSON-encoded bodies.
        this.app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies.

        //Setting up routes:
        this.router.setup();

        //Starting HTTP Server:
        return promisify(this.app.listen).bind(this.app)(cfg.port);
    }
}

export let webServer = new WebServer();