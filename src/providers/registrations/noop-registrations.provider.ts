import type {
  RegistrationsProvider,
  RegistrationsProviderInput,
} from "../../types/provider";
import type { RawRegistrationMetric } from "../../types/domain";

export class NoopRegistrationsProvider implements RegistrationsProvider {
  public readonly descriptor = {
    key: "noop-registrations",
    kind: "registrations" as const,
    displayName: "Noop Registrations Provider",
    description:
      "Provider nulo para sitios sin fuente de registros conectada todavia.",
  };

  public validateConfig(config: unknown): unknown {
    return config ?? {};
  }

  public async collect(
    _input: RegistrationsProviderInput,
  ): Promise<RawRegistrationMetric[]> {
    return [];
  }
}
