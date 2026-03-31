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
exports.setTourCompleteStatusTrue = exports.getTourCompletedStatus = void 0;
const schemas_1 = require("../database/schemas");
const error_class_1 = require("../utils/error.class");
// GET /api/user/tour-status
const getTourCompletedStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield schemas_1.UserModel.findById(req.userId).select('tourCompleted');
    if (!user) {
        throw new error_class_1.ErrorWithStatus("User not found", 401);
    }
    if (user.tourCompleted === undefined) {
        res.json({ success: false, data: true });
    }
    // #change to return data: {tourCompleted: user.tourCompleted}  
    res.json({ success: true, data: user.tourCompleted });
});
exports.getTourCompletedStatus = getTourCompletedStatus;
// PATCH /api/user/tour-complete
const setTourCompleteStatusTrue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield schemas_1.UserModel.updateOne({ _id: req.userId }, { tourCompleted: true });
    if (!user) {
        throw new error_class_1.ErrorWithStatus("User not found", 401);
    }
    res.json({ success: true, data: true });
});
exports.setTourCompleteStatusTrue = setTourCompleteStatusTrue;
