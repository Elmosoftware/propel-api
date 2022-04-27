// @ts-check
import { DataRoute } from "./data";
import { HomeRoute } from "./home";
import { InferRoute } from "./infer";
import { RunRoute } from "./run";
import { FrontendRoute } from "./frontend";
import { StatusRoute } from "./status";
import { SecurityRoute } from "./security";
import { Route } from "../core/route";

/**
 * All the routes in the API.
 */
export let allRoutes: Route[] = [
    new HomeRoute(),
    new StatusRoute(),
    new DataRoute(),
    new InferRoute(),
    new RunRoute(),
    new FrontendRoute(),
    new SecurityRoute()
];