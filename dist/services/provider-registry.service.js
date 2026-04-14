"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerRegistry = exports.ProviderRegistryService = void 0;
const providers_1 = require("../providers");
const errors_1 = require("../utils/errors");
class ProviderRegistryService {
    visitsProviderMap = new Map();
    registrationsProviderMap = new Map();
    constructor() {
        for (const provider of providers_1.visitsProviders) {
            this.visitsProviderMap.set(provider.descriptor.key, provider);
        }
        for (const provider of providers_1.registrationsProviders) {
            this.registrationsProviderMap.set(provider.descriptor.key, provider);
        }
    }
    getVisitsProvider(key) {
        const provider = this.visitsProviderMap.get(key);
        if (!provider) {
            throw new errors_1.AppError({
                message: `Visits provider ${key} is not registered`,
                code: "VISITS_PROVIDER_NOT_FOUND",
                statusCode: 400,
            });
        }
        return provider;
    }
    getRegistrationsProvider(key) {
        const provider = this.registrationsProviderMap.get(key);
        if (!provider) {
            throw new errors_1.AppError({
                message: `Registrations provider ${key} is not registered`,
                code: "REGISTRATIONS_PROVIDER_NOT_FOUND",
                statusCode: 400,
            });
        }
        return provider;
    }
    listProviders() {
        return [
            ...this.visitsProviderMap.values(),
            ...this.registrationsProviderMap.values(),
        ]
            .map((provider) => provider.descriptor)
            .sort((left, right) => left.key.localeCompare(right.key));
    }
}
exports.ProviderRegistryService = ProviderRegistryService;
exports.providerRegistry = new ProviderRegistryService();
