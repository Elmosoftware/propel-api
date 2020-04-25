import express from "express";

/**
 * Route interface. This willbe implemented by any route handled by the router.
 */
export interface Route {
    route(): express.Router;
}