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
exports.updateUser = exports.getUserDetails = void 0;
const schemas_1 = require("../database/schemas");
const error_class_1 = require("../utils/error.class");
const functionsAndVariables_1 = require("../utils/functionsAndVariables");
const users_controller_1 = require("./users.controller");
const getUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new error_class_1.ErrorWithStatus("Unauthorized", 401);
        }
        const user = yield schemas_1.UserModel.findById(userId).select("-password");
        if (!user) {
            throw new error_class_1.ErrorWithStatus("User not found", 404);
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserDetails = getUserDetails;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const updates = req.body;
        if (!userId) {
            throw new error_class_1.ErrorWithStatus("Unauthorized", 401);
        }
        // Capitalize name if provided
        if (updates.name) {
            updates.name = (0, functionsAndVariables_1.capitalizeFirstLetter)(updates.name.trim());
        }
        // Hash password if provided
        if (updates.password) {
            updates.password = yield (0, users_controller_1.hashPassword)(updates.password);
        }
        // Update user
        const updatedUser = yield schemas_1.UserModel.findByIdAndUpdate(userId, { $set: updates }, { new: true });
        if (!updatedUser) {
            throw new error_class_1.ErrorWithStatus("User not found", 404);
        }
        res.status(200).json({ success: true, data: updatedUser._id.toString() });
    }
    catch (err) {
        next(err);
    }
});
exports.updateUser = updateUser;
