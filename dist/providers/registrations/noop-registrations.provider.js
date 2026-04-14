"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopRegistrationsProvider = void 0;
class NoopRegistrationsProvider {
    descriptor = {
        key: "noop-registrations",
        kind: "registrations",
        displayName: "Noop Registrations Provider",
        description: "Provider nulo para sitios sin fuente de registros conectada todavia.",
    };
    validateConfig(config) {
        return config ?? {};
    }
    async collect(_input) {
        return [];
    }
}
exports.NoopRegistrationsProvider = NoopRegistrationsProvider;
