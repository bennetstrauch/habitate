"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
//# specify database when calling?
const connectToDB = () => {
    if (process.env.DB_URL) {
        mongoose_1.default.connect(process.env.DB_URL).then(() => {
            console.log("Successfully connected to MongoDB!");
        })
            .catch((error) => console.error("Error connecting to MongoDB: ", error));
    }
    else {
        console.log('Connection string missing.');
    }
};
exports.connectToDB = connectToDB;
