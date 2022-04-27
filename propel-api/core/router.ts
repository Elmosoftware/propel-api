// @ts-check
import { allRoutes } from "../routes/all-routes";
import { Route } from "./route";
import { logger } from "../services/logger-service";
import { SecurityService } from "../services/security-service";
import { Middleware } from "./middleware";

/**
 * Router for the Express.JS Web Server
 */
export class Router {

    private _app: any;

    constructor(app: any) {
        this._app = app
    }

    setup() {
        this._app.use(Middleware.auth(new SecurityService()));

        allRoutes.forEach((route: Route) => {
            logger.logDebug(`Adding route "${route.name}" to the app instance.`)
            this._app.use(route.path, route.handler());
        })
    }
}
