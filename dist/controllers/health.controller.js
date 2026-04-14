"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = void 0;
const constants_1 = require("../config/constants");
const env_1 = require("../config/env");
const keyed_serial_queue_service_1 = require("../services/queue/keyed-serial-queue.service");
const site_service_1 = require("../services/site.service");
const api_response_1 = require("../utils/api-response");
const getHealth = (req, res) => (0, api_response_1.sendSuccess)(req, res, {
    message: "Service healthy",
    data: {
        name: constants_1.APP_NAME,
        version: constants_1.APP_VERSION,
        environment: env_1.env.nodeEnv,
        configuredSites: site_service_1.siteService.list().length,
        pendingEventKeys: keyed_serial_queue_service_1.keyedSerialQueueService.getPendingKeys(),
    },
});
exports.getHealth = getHealth;
