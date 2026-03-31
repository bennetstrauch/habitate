import express, { json, urlencoded } from "express";
import cors from "cors";
import morgan from "morgan";
import { userRouter } from "./users/users.router";
import { errorHandler, routerNotFoundHandler } from "./utils/handlers";
import { connectToDB } from "./database/connection";
import { goalsRouter } from "./goals/goals.router";
import { checkToken } from "./users/users.middleware";
import { progressRouter } from "./progresses/progresses.router";
import { healthCheck } from "./utils/healthcheck";
import { reflectionsRouter } from "./reflections/reflections.router";
import { commentsRouter } from "./comments/comments.router";

// to run the cron jobs need to import them here:
import "./progresses/create.progress.cron";
import "./reflections/reflectionReminder/sheduler.reminder.cron";
import { logPayload } from "./utils/log";

const app = express();

connectToDB();

app.use(morgan("dev"));
app.use(cors());
app.use(json());
app.use(urlencoded());

app.use("/users", userRouter);
app.use("/goals", checkToken, goalsRouter);
app.use("/progresses", checkToken, progressRouter);
app.use("/reflections", checkToken, reflectionsRouter);
app.use("/comments", checkToken, commentsRouter);

app.get("/health", healthCheck);
app.post('/log', logPayload)


app.use(routerNotFoundHandler);
app.use(errorHandler);

app.listen(3000, () => console.log("Server listening on Port 3000"));

// test()
