"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRouter = void 0;
const express_1 = require("express");
const run_controller_1 = require("../controllers/run.controller");
const common_schema_1 = require("../schemas/common.schema");
const validate_request_1 = require("../middleware/validate-request");
exports.runRouter = (0, express_1.Router)();
exports.runRouter.get("/runs/:runId", (0, validate_request_1.validateRequest)({ params: common_schema_1.runIdParamsSchema }), run_controller_1.getRunById);
