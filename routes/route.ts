import express from "express";

export interface Route {
    route(): express.Router;
}