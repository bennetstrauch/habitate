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
exports.getReflectionFromDBOrCreate = void 0;
const schemas_1 = require("../database/schemas");
const newReflection_1 = require("./newReflection");
const getReflectionFromDBOrCreate = (user_id, date) => __awaiter(void 0, void 0, void 0, function* () {
    //#do i need try catch?
    const reflection = yield schemas_1.ReflectionModel.findOneAndUpdate({ user_id, date }, { $setOnInsert: (0, newReflection_1.getNewReflectionForDate)(user_id, date) }, { new: true, upsert: true });
    return reflection;
});
exports.getReflectionFromDBOrCreate = getReflectionFromDBOrCreate;
