import { RequestHandler, ErrorRequestHandler } from "express";
import { ErrorWithStatus } from "./error.class";

export const routerNotFoundHandler: RequestHandler = (req, res, next) => {
  next(new ErrorWithStatus("Route not found", 404));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(error.message);
  } else {
    res.status(500).json(error.message);

    console.error("Error: ", error);
  }
};
