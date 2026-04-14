import { z } from "zod";

import { BaseJsonApiProvider } from "../shared/base-json-api.provider";
import type { RawRegistrationMetric } from "../../types/domain";
import type {
  RegistrationsProvider,
  RegistrationsProviderInput,
} from "../../types/provider";

const registrationsPayloadItemSchema = z
  .object({
    route: z.string().optional().nullable(),
    path: z.string().optional().nullable(),
    pathname: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    pageUrl: z.string().optional().nullable(),
    page_url: z.string().optional().nullable(),
    registrations: z.coerce.number().int().nonnegative().optional(),
    count: z.coerce.number().int().nonnegative().optional(),
    submissions: z.coerce.number().int().nonnegative().optional(),
    conversions: z.coerce.number().int().nonnegative().optional(),
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
      [value.registrations, value.count, value.submissions, value.conversions].some(
        (entry) => entry !== undefined,
      ),
    {
      message:
        "Each registrations item must include registrations, count, submissions or conversions",
    },
  );

export class JsonApiRegistrationsProvider
  extends BaseJsonApiProvider
  implements RegistrationsProvider
{
  public readonly descriptor = {
    key: "json-api-registrations",
    kind: "registrations" as const,
    displayName: "JSON API Registrations Provider",
    description:
      "Consume una API HTTP JSON externa para obtener registros por ruta y UTM.",
  };

  public async collect(
    input: RegistrationsProviderInput,
  ): Promise<RawRegistrationMetric[]> {
    const config = this.validateConfig(input.providerConfig);
    const items = await this.fetchItems(config, input.context);
    const parsedItems = z.array(registrationsPayloadItemSchema).parse(items);

    return parsedItems.map((item) => ({
      rawRoute: item.route ?? item.path ?? item.pathname ?? undefined,
      rawUrl: item.url ?? item.pageUrl ?? item.page_url ?? undefined,
      registrations:
        item.registrations ??
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
