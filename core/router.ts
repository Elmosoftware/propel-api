// @ts-check
import { DataRouter } from "../routes/data";
import { HomeRouter } from "../routes/home";
import { InferRouter } from "../routes/infer";

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
        let inferRouter = new InferRouter();

        //Home:
        this._app.use("/api", homeRouter.route());
        //GraphQL Data endpoint:
        this._app.use("/api/data", dataRouter.route());
        //Infer:
        this._app.use("/api/infer", inferRouter.route());
    }
}
