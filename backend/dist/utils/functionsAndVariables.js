"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoAttachmentForEmail = exports.calculateStartAndEndDate = exports.getDateForTimezone = exports.getDateOnlyForTimeZone = exports.idToObjectId = exports.idsToArrayOfObjectIds = exports.appNameForSendingEmails = void 0;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.getRandomElement = getRandomElement;
exports.getRandomPhrase = getRandomPhrase;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const path_1 = __importDefault(require("path"));
exports.appNameForSendingEmails = `"Habitate" <${process.env.EMAIL_USER}>`;
function capitalizeFirstLetter(str) {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
const idsToArrayOfObjectIds = (ids) => {
    return ids.split(",").map((id) => (0, exports.idToObjectId)(id));
};
exports.idsToArrayOfObjectIds = idsToArrayOfObjectIds;
const idToObjectId = (id) => {
    return new mongoose_1.default.Types.ObjectId(id);
};
exports.idToObjectId = idToObjectId;
const getDateOnlyForTimeZone = (timezone) => {
    return moment_timezone_1.default.tz(timezone).format("YYYY-MM-DD");
};
exports.getDateOnlyForTimeZone = getDateOnlyForTimeZone;
//## rmv this and luxon dependency, and we could unify those two.
const getDateForTimezone = (timezone) => {
    return moment_timezone_1.default.tz(timezone).startOf("day").toDate();
};
exports.getDateForTimezone = getDateForTimezone;
// type DateString = `${number}-${number}-${number}`;
// ##could be used
//## move to date.utils take out period in type
const calculateStartAndEndDate = (period, offset, date) => {
    let startDate;
    let endDate;
    const offsetAsInt = parseInt(offset) || 0;
    const startMoment = moment_timezone_1.default.utc(date, "YYYY-MM-DD").add(offsetAsInt, period);
    const periodForMoment = period === "week" ? "isoWeek" : period;
    startDate = startMoment.startOf(periodForMoment).toDate(); // isoWeek starts on Monday
    endDate = startMoment.endOf(periodForMoment).endOf("day").toDate();
    return { startDate, endDate };
};
exports.calculateStartAndEndDate = calculateStartAndEndDate;
function getRandomElement(options) {
    return options[Math.floor(Math.random() * options.length)];
}
function getRandomPhrase(options) {
    return getRandomElement(options);
}
// ## logo path is different between dev (one ../ less) and production.
const logoPath = path_1.default.join(__dirname, "../../../global/assets/habitatelogo_64.png");
exports.logoAttachmentForEmail = {
    filename: "logo.png",
    path: logoPath,
    cid: "habitateLogo",
};
