"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const errors_1 = require("../utils/errors");
const notFoundMiddleware = (req, _res, next) => {
    next(new errors_1.AppError({
        message: `Route ${req.method} ${req.originalUrl} not found`,
        code: "ROUTE_NOT_FOUND",
        statusCode: 404,
    }));
};
exports.notFoundMiddleware = notFoundMiddleware;
