// @ts-check

/**
 * Router for the Express JS Web Server
 */
class Router {

    constructor(app) {
        this._app = app
    }

    setup() {

        // //Website root:
        // this._app.get('/', (req, res) => {
        //     res.send("<h1>Propel API</h1><p><h2>Reach your servers!</h2></p>")
        // });

        //Home:
        this._app.use("/api", require("../routes/home"));
        //Data:
        this._app.use("/api/data", require("../routes/data"));
    }
}

module.exports = Router;
