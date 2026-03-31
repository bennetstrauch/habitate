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
exports.createAndSaveProgressForDate = exports.getNewProgressForDate = void 0;
const generateObjectId_1 = require("../utils/generateObjectId");
const schemas_1 = require("../database/schemas");
const getNewProgressForDate = (habit_id, date) => {
    return {
        _id: (0, generateObjectId_1.generateObjectIdAsString)(), //#check type later on
        habit_id: habit_id,
        date: date,
        completed: false,
        attempted: false,
    };
};
exports.getNewProgressForDate = getNewProgressForDate;
const createAndSaveProgressForDate = (habit_id, date) => __awaiter(void 0, void 0, void 0, function* () {
    //
    const newProgress = (0, exports.getNewProgressForDate)(habit_id, date);
    return yield schemas_1.HabitProgressModel.create(newProgress);
});
exports.createAndSaveProgressForDate = createAndSaveProgressForDate;
