"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationsProviders = exports.visitsProviders = void 0;
const json_api_registrations_provider_1 = require("./registrations/json-api-registrations.provider");
const noop_registrations_provider_1 = require("./registrations/noop-registrations.provider");
const json_api_visits_provider_1 = require("./visits/json-api-visits.provider");
exports.visitsProviders = [new json_api_visits_provider_1.JsonApiVisitsProvider()];
exports.registrationsProviders = [
    new json_api_registrations_provider_1.JsonApiRegistrationsProvider(),
    new noop_registrations_provider_1.NoopRegistrationsProvider(),
];
