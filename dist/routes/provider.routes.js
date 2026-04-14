"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerRouter = void 0;
const express_1 = require("express");
const provider_controller_1 = require("../controllers/provider.controller");
exports.providerRouter = (0, express_1.Router)();
exports.providerRouter.get("/providers", provider_controller_1.listProviders);
