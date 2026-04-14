"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteRouter = void 0;
const express_1 = require("express");
const site_controller_1 = require("../controllers/site.controller");
exports.siteRouter = (0, express_1.Router)();
exports.siteRouter.get("/sites", site_controller_1.listSites);
