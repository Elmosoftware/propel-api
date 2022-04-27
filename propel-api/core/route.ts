import express from "express";
import { SecurityRule } from "./security-rule";

/**
 * Route interface. This will be implemented by any route handled by the router.
 */
export interface Route {
    /**
     * Name of the route.
     */
    name: string;

    /**
     * Relative path, like /users.
     */
    path: string;

    /**
     * Security rules for this route.
     */
    security: SecurityRule[];

    /**
     * Express router handler.
     */
    handler(): express.Router;
}

