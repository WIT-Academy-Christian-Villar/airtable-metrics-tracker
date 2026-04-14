"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonApiVisitsProvider = void 0;
const zod_1 = require("zod");
const base_json_api_provider_1 = require("../shared/base-json-api.provider");
const visitsPayloadItemSchema = zod_1.z
    .object({
    route: zod_1.z.string().optional().nullable(),
    path: zod_1.z.string().optional().nullable(),
    pathname: zod_1.z.string().optional().nullable(),
    url: zod_1.z.string().optional().nullable(),
    pageUrl: zod_1.z.string().optional().nullable(),
    page_url: zod_1.z.string().optional().nullable(),
    visits: zod_1.z.coerce.number().int().nonnegative().optional(),
    count: zod_1.z.coerce.number().int().nonnegative().optional(),
    pageviews: zod_1.z.coerce.number().int().nonnegative().optional(),
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
    .refine((value) => [value.visits, value.count, value.pageviews].some((entry) => entry !== undefined), {
    message: "Each visits item must include visits, count or pageviews",
});
class JsonApiVisitsProvider extends base_json_api_provider_1.BaseJsonApiProvider {
    descriptor = {
        key: "json-api-visits",
        kind: "visits",
        displayName: "JSON API Visits Provider",
        description: "Consume una API HTTP JSON externa para obtener visitas por ruta.",
    };
    async collect(input) {
        const config = this.validateConfig(input.providerConfig);
        const items = await this.fetchItems(config, input.context);
        const parsedItems = zod_1.z.array(visitsPayloadItemSchema).parse(items);
        return parsedItems.map((item) => ({
            rawRoute: item.route ?? item.path ?? item.pathname ?? undefined,
            rawUrl: item.url ?? item.pageUrl ?? item.page_url ?? undefined,
            visits: item.visits ?? item.count ?? item.pageviews ?? 0,
            utms: this.buildUtmPayload(item),
            capturedAt: item.capturedAt ?? item.captured_at,
            dateBucket: item.dateBucket ?? item.date_bucket,
            source: item.source ?? item.provider ?? this.descriptor.key,
            metadata: item,
        }));
    }
}
exports.JsonApiVisitsProvider = JsonApiVisitsProvider;
