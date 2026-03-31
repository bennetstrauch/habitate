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
exports.requireFriendship = void 0;
const schemas_1 = require("../database/schemas");
const error_class_1 = require("./error.class");
const requireFriendship = (userId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!userId)
        throw new error_class_1.ErrorWithStatus("Unauthorized", 401);
    const user = yield schemas_1.UserModel.findById(userId, "connections");
    const isConnected = (_a = user === null || user === void 0 ? void 0 : user.connections) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === friendId);
    if (!isConnected) {
        throw new error_class_1.ErrorWithStatus("Not connected to this user", 403);
    }
    return friendId;
});
exports.requireFriendship = requireFriendship;
