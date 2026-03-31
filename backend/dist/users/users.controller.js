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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = exports.checkEmail = exports.login = exports.register = void 0;
const error_class_1 = require("../utils/error.class");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const schemas_1 = require("../database/schemas");
const create_progress_cron_1 = require("../progresses/create.progress.cron");
const functionsAndVariables_1 = require("../utils/functionsAndVariables");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = req.body;
        newUser.name = (0, functionsAndVariables_1.capitalizeFirstLetter)(newUser.name.trim());
        const hashedPassword = yield (0, exports.hashPassword)(newUser.password);
        const newUserHashed = Object.assign(Object.assign({}, req.body), { password: hashedPassword });
        const savedUser = yield schemas_1.UserModel.create(newUserHashed);
        const newUserId = savedUser._id.toString();
        yield (0, create_progress_cron_1.createDailyReflectionForUserIds)([newUserId], (0, functionsAndVariables_1.getDateForTimezone)(savedUser.timezone));
        //
        res.status(201).json({ success: true, data: newUserId });
        console.log("User created successfully: ", savedUser);
    }
    catch (err) {
        next(err);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find user
        const user = yield schemas_1.UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new error_class_1.ErrorWithStatus("Invalid email", 401);
        }
        // Compare password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new error_class_1.ErrorWithStatus("Invalid password", 401);
        }
        // Generate token
        if (!process.env.SECRET_KEY_FOR_SIGNING_TOKEN) {
            throw new error_class_1.ErrorWithStatus("Secret not found", 401);
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, name: user.name, email: user.email }, process.env.SECRET_KEY_FOR_SIGNING_TOKEN, {
            expiresIn: "1w",
        });
        // Send token
        res.status(200).json({ success: true, data: { token } });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
const checkEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    try {
        const user = yield schemas_1.UserModel.findOne({ email: email.toLowerCase() });
        if (user) {
            res.status(200).json({ success: true, data: true });
        }
        else {
            res.status(200).json({ success: true, data: false });
        }
    }
    catch (err) {
        next(err);
    }
});
exports.checkEmail = checkEmail;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    return hashedPassword;
});
exports.hashPassword = hashPassword;
