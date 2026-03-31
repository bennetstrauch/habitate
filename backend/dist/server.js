"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const users_router_1 = require("./users/users.router");
const handlers_1 = require("./utils/handlers");
const connection_1 = require("./database/connection");
const goals_router_1 = require("./goals/goals.router");
const users_middleware_1 = require("./users/users.middleware");
const progresses_router_1 = require("./progresses/progresses.router");
const healthcheck_1 = require("./utils/healthcheck");
const reflections_router_1 = require("./reflections/reflections.router");
// to run the cron jobs need to import them here:
require("./progresses/create.progress.cron");
require("./reflections/reflectionReminder/sheduler.reminder.cron");
const log_1 = require("./utils/log");
const app = (0, express_1.default)();
(0, connection_1.connectToDB)();
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
app.use((0, express_1.json)());
app.use((0, express_1.urlencoded)());
app.use("/users", users_router_1.userRouter);
app.use("/goals", users_middleware_1.checkToken, goals_router_1.goalsRouter);
app.use("/progresses", users_middleware_1.checkToken, progresses_router_1.progressRouter);
app.use("/reflections", users_middleware_1.checkToken, reflections_router_1.reflectionsRouter);
app.get("/health", healthcheck_1.healthCheck);
app.post('/log', log_1.logPayload);
app.use(handlers_1.routerNotFoundHandler);
app.use(handlers_1.errorHandler);
app.listen(3000, () => console.log("Server listening on Port 3000"));
// test()
