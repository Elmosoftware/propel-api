// @ts-check
import { DataRouter } from "../routes/data";
import { HomeRouter } from "../routes/home";
import { InferRouter } from "../routes/infer";
import { RunRouter } from "../routes/run";
import { FrontendRouter } from "../routes/frontend";
import { StatusRouter } from "../routes/status";

/**
 * Router for the Express JS Web Server
 */
export class Router {

    private _app: any;

    constructor(app: any) {
        this._app = app
    }

    setup() {
        let homeRouter = new HomeRouter();
        let statusRouter = new StatusRouter();      
        let dataRouter = new DataRouter();
        let inferRouter = new InferRouter();
        let runRouter = new RunRouter();
        let frontendRouter = new FrontendRouter();

        //Home:
        this._app.use("/api", homeRouter.route());
        //Status:
        this._app.use("/api/status", statusRouter.route());
        //Data endpoint:
        this._app.use("/api/data", dataRouter.route());
        //Infer:
        this._app.use("/api/infer", inferRouter.route());
        //Run:
        this._app.use("/api/run", runRouter.route());
        //Propel Frontend:
        this._app.use("/", frontendRouter.route());
    }
}
