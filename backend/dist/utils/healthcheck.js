"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const healthCheck = (req, res) => {
    res
        .status(200)
        .json({ success: true, data: "Server is running and super healthy ;)" });
};
exports.healthCheck = healthCheck;
