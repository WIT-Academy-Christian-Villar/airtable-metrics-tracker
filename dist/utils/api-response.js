"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const sendSuccess = (req, res, options) => res.status(options.statusCode ?? 200).json({
    success: true,
    message: options.message,
    data: options.data,
    meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        runId: options.runId,
    },
});
exports.sendSuccess = sendSuccess;
