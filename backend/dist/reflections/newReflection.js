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
exports.createAndSaveReflectionForDate = exports.getNewReflectionForDate = void 0;
const schemas_1 = require("../database/schemas");
const generateObjectId_1 = require("../utils/generateObjectId");
const getNewReflectionForDate = (user_id, date) => {
    return {
        _id: (0, generateObjectId_1.generateObjectIdAsString)(),
        user_id: user_id,
        //#maybe dynamic for weekly
        type: "daily",
        date: date,
        completed: false,
    };
};
exports.getNewReflectionForDate = getNewReflectionForDate;
// # needed?
const createAndSaveReflectionForDate = (user_id, date) => __awaiter(void 0, void 0, void 0, function* () {
    //
    const newReflection = (0, exports.getNewReflectionForDate)(user_id, date);
    return yield schemas_1.ReflectionModel.create(newReflection);
});
exports.createAndSaveReflectionForDate = createAndSaveReflectionForDate;
