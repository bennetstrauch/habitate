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
exports.removeConnection = exports.connect = exports.getConnections = exports.regenerateInviteCode = exports.getInviteCode = void 0;
const schemas_1 = require("../database/schemas");
const error_class_1 = require("../utils/error.class");
const MAX_UPLIFTERS = 5;
function generateInviteCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars (0/O, 1/I)
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function generateUniqueCode() {
    return __awaiter(this, void 0, void 0, function* () {
        let code;
        let exists;
        do {
            code = generateInviteCode();
            exists = !!(yield schemas_1.UserModel.findOne({ inviteCode: code }, "_id"));
        } while (exists);
        return code;
    });
}
const getInviteCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield schemas_1.UserModel.findById(req.userId, "inviteCode");
        if (!user)
            throw new error_class_1.ErrorWithStatus("User not found", 404);
        if (!user.inviteCode) {
            const code = yield generateUniqueCode();
            user = yield schemas_1.UserModel.findByIdAndUpdate(req.userId, { inviteCode: code }, { new: true, select: "inviteCode" });
        }
        res.json({ success: true, data: { inviteCode: user.inviteCode } });
    }
    catch (err) {
        next(err);
    }
});
exports.getInviteCode = getInviteCode;
const regenerateInviteCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const code = yield generateUniqueCode();
        yield schemas_1.UserModel.updateOne({ _id: req.userId }, { inviteCode: code });
        res.json({ success: true, data: { inviteCode: code } });
    }
    catch (err) {
        next(err);
    }
});
exports.regenerateInviteCode = regenerateInviteCode;
const getConnections = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield schemas_1.UserModel.findById(req.userId, "connections").populate("connections", "name _id");
        if (!user)
            throw new error_class_1.ErrorWithStatus("User not found", 404);
        res.json({ success: true, data: (_a = user.connections) !== null && _a !== void 0 ? _a : [] });
    }
    catch (err) {
        next(err);
    }
});
exports.getConnections = getConnections;
const connect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { code } = req.body;
        if (!code)
            throw new error_class_1.ErrorWithStatus("Invite code required", 400);
        const friend = yield schemas_1.UserModel.findOne({ inviteCode: code.trim().toUpperCase() }, "_id name connections");
        if (!friend)
            throw new error_class_1.ErrorWithStatus("No user found with that code", 404);
        if (friend._id.toString() === req.userId) {
            throw new error_class_1.ErrorWithStatus("You cannot add yourself", 400);
        }
        const me = yield schemas_1.UserModel.findById(req.userId, "connections");
        if (!me)
            throw new error_class_1.ErrorWithStatus("User not found", 404);
        const myConnections = ((_a = me.connections) !== null && _a !== void 0 ? _a : []);
        if (myConnections.some((id) => id.toString() === friend._id.toString())) {
            throw new error_class_1.ErrorWithStatus("Already connected", 400);
        }
        if (myConnections.length >= MAX_UPLIFTERS) {
            throw new error_class_1.ErrorWithStatus(`You can have at most ${MAX_UPLIFTERS} Uplifters`, 400);
        }
        const friendConnections = ((_b = friend.connections) !== null && _b !== void 0 ? _b : []);
        if (friendConnections.length >= MAX_UPLIFTERS) {
            throw new error_class_1.ErrorWithStatus("This person already has the maximum number of Uplifters", 400);
        }
        yield schemas_1.UserModel.updateOne({ _id: req.userId }, { $addToSet: { connections: friend._id } });
        yield schemas_1.UserModel.updateOne({ _id: friend._id }, { $addToSet: { connections: req.userId } });
        res.json({
            success: true,
            data: { _id: friend._id.toString(), name: friend.name },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.connect = connect;
const removeConnection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { friendId } = req.params;
        yield schemas_1.UserModel.updateOne({ _id: req.userId }, { $pull: { connections: friendId } });
        yield schemas_1.UserModel.updateOne({ _id: friendId }, { $pull: { connections: req.userId } });
        res.json({ success: true, data: null });
    }
    catch (err) {
        next(err);
    }
});
exports.removeConnection = removeConnection;
