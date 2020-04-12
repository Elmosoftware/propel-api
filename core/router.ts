// @ts-check
import { DataRouter } from "../routes/data";
import { HomeRouter } from "../routes/home";

/**
 * Router for the Express JS Web Server
 */
export class Router {

    private _app: any;

    constructor(app: any) {
        this._app = app
    }

    setup() {
        let homeRouter = new HomeRouter()
        let dataRouter = new DataRouter();

        //Home:
        this._app.use("/api", homeRouter.route());
        //Data:
        this._app.use("/api/data", dataRouter.route());
    }
}
