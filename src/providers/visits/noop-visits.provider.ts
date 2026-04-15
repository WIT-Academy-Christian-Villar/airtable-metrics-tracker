import type { RawVisitMetric } from "../../types/domain";
import type { VisitsProvider, VisitsProviderInput } from "../../types/provider";

export class NoopVisitsProvider implements VisitsProvider {
  public readonly descriptor = {
    key: "noop-visits",
    kind: "visits" as const,
    displayName: "Noop Visits Provider",
    description: "Returns no visit metrics and enables event-only site configs.",
  };

  public validateConfig(config: unknown): unknown {
    return config ?? {};
  }

  public async collect(_input: VisitsProviderInput): Promise<RawVisitMetric[]> {
    return [];
  }
}
