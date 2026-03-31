"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateOnlyStringToUTCDate = exports.getTodaysDateOnlyAsString = exports.localDateOnlyToString = void 0;
const localDateOnlyToString = (date) => {
    return date.toLocaleDateString('en-CA');
};
exports.localDateOnlyToString = localDateOnlyToString;
const getTodaysDateOnlyAsString = () => {
    console.log('getTodaysDateOnlyAsString', (0, exports.localDateOnlyToString)(new Date()));
    return (0, exports.localDateOnlyToString)(new Date());
};
exports.getTodaysDateOnlyAsString = getTodaysDateOnlyAsString;
const dateOnlyStringToUTCDate = (dateString) => {
    return new Date(dateString + 'T00:00:00.000Z');
};
exports.dateOnlyStringToUTCDate = dateOnlyStringToUTCDate;
