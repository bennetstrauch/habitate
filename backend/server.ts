import express, { json, urlencoded } from "express";
import cors from "cors";
import morgan from "morgan";
import { userRouter } from "./users/users.router";
import { errorHandler, routerNotFoundHandler } from "./utils/handlers";
import { connectToDB } from "./database/connection";
import { goalRouter } from "./goals/goals.router";
import { checkToken } from "./users/users.middleware";
import { progressRouter } from "./progress/progresses.router";
import { healthCheck } from "./utils/healthcheck.router";

const app = express();

connectToDB();

app.use(morgan("dev"));
app.use(cors());
app.use(json());
app.use(urlencoded());

app.use("/users", userRouter);
app.use("/goals", checkToken, goalRouter);
app.use("/progresses", checkToken, progressRouter);
app.post("/health", healthCheck)

app.use(routerNotFoundHandler);
app.use(errorHandler);

app.listen(3000, () => console.log("Server listening on Port 3000"));


// test()
