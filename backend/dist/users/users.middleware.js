"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const error_class_1 = require("../utils/error.class");
const checkToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader)
            throw new error_class_1.ErrorWithStatus("No Token Found", 401);
        const token = authHeader.split(" ")[1];
        if (!process.env.SECRET_KEY_FOR_SIGNING_TOKEN)
            throw new error_class_1.ErrorWithStatus("Secret not found", 401);
        // const payload = verify(token, process.env.SECRET_KEY_FOR_SIGNING_TOKEN);
        const payload = (0, jsonwebtoken_1.verify)(token, process.env.SECRET_KEY_FOR_SIGNING_TOKEN);
        req.userId = payload._id;
        console.log("payload", payload);
        next();
    }
    catch (e) {
        if (e instanceof jsonwebtoken_1.TokenExpiredError) {
            console.log("Token Expired");
            next(new error_class_1.ErrorWithStatus("Token Expired", 401));
        }
        else {
            next(e);
        }
    }
});
exports.checkToken = checkToken;
