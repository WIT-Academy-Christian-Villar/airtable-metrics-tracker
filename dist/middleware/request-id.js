"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = void 0;
const node_crypto_1 = require("node:crypto");
const requestIdMiddleware = (req, res, next) => {
    const headerRequestId = req.header("x-request-id")?.trim();
    req.requestId = headerRequestId || `req_${(0, node_crypto_1.randomUUID)()}`;
    res.setHeader("x-request-id", req.requestId);
    next();
};
exports.requestIdMiddleware = requestIdMiddleware;
