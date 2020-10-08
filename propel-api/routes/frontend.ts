// @ts-check
import express from "express";
import path from "path";

import { Route } from "./route";
import { logger } from "../services/logger-service";
import { cfg } from "../core/config";

export const WEBSITE_FOLDER = "propel-web"

/**
 * Frontend route. Returns the Propel APP.
 * @implements Route.
 */
export class FrontendRouter implements Route {

    constructor() {
    }

    getFrontendPath(): string {
        //@ts-ignore
        let root: string[] = require.main?.path.split("\\");
        root.splice(root.length - 1, 1); //Moving in the absolute path, to the parent folder.
        return path.join(root.join("\\"), WEBSITE_FOLDER);
    }

    route(): express.Router {

        const handler = express.Router();
        const frontendPath: string = this.getFrontendPath();

        //To get the Propel frontend in this way is only for production environment.
        //For Dev we are using the Angular live development environment.
        if (cfg.isProduction) {
            logger.logDebug(`Propel Website index file:${path.join(frontendPath, '/index.html')}`);

            // Run the app by serving the static files in the dist directory
            handler.use(express.static(frontendPath));

            handler.get("*", (req, res) => {
                res.sendFile(path.join(frontendPath, '/index.html'));
            });
        }        

        return handler;
    }
}
