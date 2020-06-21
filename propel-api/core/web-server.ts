// @ts-check

//Node libraries
import { promisify } from "util";

//Express App & Middlewares dependencies:
import express from "express";
import expressWs from "express-ws";
import bodyParser from "body-parser";
import cors from "cors";

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
        expressWs(this.app)
        this.router = new Router(this.app);
    }

    start() {
        //Setting up Middlewares:
        this.app.use(bodyParser.json()); // to support JSON-encoded bodies.
        this.app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies.
        this.app.use(bodyParser.text({ type: "text/plain" })); //to support plain text in the body. 
        //Used to infer script parameters.
        this.app.use(cors()); //CORS.

        //Setting up routes:
        this.router.setup();

        //Starting HTTP Server:
        return promisify(this.app.listen).bind(this.app)(cfg.port);
    }
}

export let webServer = new WebServer();