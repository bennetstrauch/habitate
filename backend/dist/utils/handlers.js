"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.routerNotFoundHandler = void 0;
const error_class_1 = require("./error.class");
const routerNotFoundHandler = (req, res, next) => {
    next(new error_class_1.ErrorWithStatus("Route not found", 404));
};
exports.routerNotFoundHandler = routerNotFoundHandler;
const errorHandler = (error, req, res, next) => {
    if (error instanceof error_class_1.ErrorWithStatus) {
        res.status(error.status).json(error.message);
    }
    else {
        res.status(500).json(error.message);
        console.error("Error: ", error);
    }
};
exports.errorHandler = errorHandler;
