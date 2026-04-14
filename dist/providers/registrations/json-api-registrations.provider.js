"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonApiRegistrationsProvider = void 0;
const zod_1 = require("zod");
const base_json_api_provider_1 = require("../shared/base-json-api.provider");
const registrationsPayloadItemSchema = zod_1.z
    .object({
    route: zod_1.z.string().optional().nullable(),
    path: zod_1.z.string().optional().nullable(),
    pathname: zod_1.z.string().optional().nullable(),
    url: zod_1.z.string().optional().nullable(),
    pageUrl: zod_1.z.string().optional().nullable(),
    page_url: zod_1.z.string().optional().nullable(),
    registrations: zod_1.z.coerce.number().int().nonnegative().optional(),
    count: zod_1.z.coerce.number().int().nonnegative().optional(),
    submissions: zod_1.z.coerce.number().int().nonnegative().optional(),
    conversions: zod_1.z.coerce.number().int().nonnegative().optional(),
    source: zod_1.z.string().optional(),
    provider: zod_1.z.string().optional(),
    capturedAt: zod_1.z.string().optional(),
    captured_at: zod_1.z.string().optional(),
    dateBucket: zod_1.z.string().optional(),
    date_bucket: zod_1.z.string().optional(),
    utms: zod_1.z.record(zod_1.z.unknown()).optional(),
    utm: zod_1.z.record(zod_1.z.unknown()).optional(),
    dimensions: zod_1.z.record(zod_1.z.unknown()).optional(),
})
    .passthrough()
    .refine((value) => [value.registrations, value.count, value.submissions, value.conversions].some((entry) => entry !== undefined), {
    message: "Each registrations item must include registrations, count, submissions or conversions",
});
class JsonApiRegistrationsProvider extends base_json_api_provider_1.BaseJsonApiProvider {
    descriptor = {
        key: "json-api-registrations",
        kind: "registrations",
        displayName: "JSON API Registrations Provider",
        description: "Consume una API HTTP JSON externa para obtener registros por ruta y UTM.",
    };
    async collect(input) {
        const config = this.validateConfig(input.providerConfig);
        const items = await this.fetchItems(config, input.context);
        const parsedItems = zod_1.z.array(registrationsPayloadItemSchema).parse(items);
        return parsedItems.map((item) => ({
            rawRoute: item.route ?? item.path ?? item.pathname ?? undefined,
            rawUrl: item.url ?? item.pageUrl ?? item.page_url ?? undefined,
            registrations: item.registrations ??
                item.count ??
                item.submissions ??
                item.conversions ??
                0,
            utms: this.buildUtmPayload(item),
            capturedAt: item.capturedAt ?? item.captured_at,
            dateBucket: item.dateBucket ?? item.date_bucket,
            source: item.source ?? item.provider ?? this.descriptor.key,
            metadata: item,
        }));
    }
}
exports.JsonApiRegistrationsProvider = JsonApiRegistrationsProvider;
