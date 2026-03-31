"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorWithStatus = void 0;
class ErrorWithStatus extends Error {
    constructor(message, status, error) {
        super(message);
        this.message = message;
        this.status = status;
        this.error = error;
    }
}
exports.ErrorWithStatus = ErrorWithStatus;
// ## questionmark needed?
