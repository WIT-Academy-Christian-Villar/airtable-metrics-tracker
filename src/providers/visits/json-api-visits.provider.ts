import { z } from "zod";

import { BaseJsonApiProvider } from "../shared/base-json-api.provider";
import type { RawVisitMetric } from "../../types/domain";
import type { VisitsProvider, VisitsProviderInput } from "../../types/provider";

const visitsPayloadItemSchema = z
  .object({
    route: z.string().optional().nullable(),
    path: z.string().optional().nullable(),
    pathname: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    pageUrl: z.string().optional().nullable(),
    page_url: z.string().optional().nullable(),
    visits: z.coerce.number().int().nonnegative().optional(),
    count: z.coerce.number().int().nonnegative().optional(),
    pageviews: z.coerce.number().int().nonnegative().optional(),
    source: z.string().optional(),
    provider: z.string().optional(),
    capturedAt: z.string().optional(),
    captured_at: z.string().optional(),
    dateBucket: z.string().optional(),
    date_bucket: z.string().optional(),
    utms: z.record(z.unknown()).optional(),
    utm: z.record(z.unknown()).optional(),
    dimensions: z.record(z.unknown()).optional(),
  })
  .passthrough()
  .refine(
    (value) =>
      [value.visits, value.count, value.pageviews].some(
        (entry) => entry !== undefined,
      ),
    {
      message: "Each visits item must include visits, count or pageviews",
    },
  );

export class JsonApiVisitsProvider
  extends BaseJsonApiProvider
  implements VisitsProvider
{
  public readonly descriptor = {
    key: "json-api-visits",
    kind: "visits" as const,
    displayName: "JSON API Visits Provider",
    description:
      "Consume una API HTTP JSON externa para obtener visitas por ruta.",
  };

  public async collect(input: VisitsProviderInput): Promise<RawVisitMetric[]> {
    const config = this.validateConfig(input.providerConfig);
    const items = await this.fetchItems(config, input.context);
    const parsedItems = z.array(visitsPayloadItemSchema).parse(items);

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
