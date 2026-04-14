"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProviders = void 0;
const provider_registry_service_1 = require("../services/provider-registry.service");
const api_response_1 = require("../utils/api-response");
const listProviders = (req, res) => (0, api_response_1.sendSuccess)(req, res, {
    message: "Registered providers",
    data: {
        items: provider_registry_service_1.providerRegistry.listProviders(),
        count: provider_registry_service_1.providerRegistry.listProviders().length,
    },
});
exports.listProviders = listProviders;
