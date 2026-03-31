"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressRouter = void 0;
const express_1 = require("express");
const progress_controller_1 = require("./progress.controller");
const router = (0, express_1.Router)();
//## standardize
router.get("", progress_controller_1.getProgresses);
router.post("", progress_controller_1.createProgress);
router.get("/stats", progress_controller_1.getProgressStats);
router.get("/:progress_id", progress_controller_1.getProgress);
router.put("/:progress_id", progress_controller_1.putProgress);
router.post("/batch", progress_controller_1.createBatchProgresses);
exports.progressRouter = router;
