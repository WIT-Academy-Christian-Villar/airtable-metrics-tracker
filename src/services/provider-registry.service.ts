import {
  registrationsProviders,
  visitsProviders,
} from "../providers";
import type {
  ProviderDescriptor,
  RegistrationsProvider,
  VisitsProvider,
} from "../types/provider";
import { AppError } from "../utils/errors";

export class ProviderRegistryService {
  private readonly visitsProviderMap = new Map<string, VisitsProvider>();
  private readonly registrationsProviderMap = new Map<string, RegistrationsProvider>();

  public constructor() {
    for (const provider of visitsProviders) {
      this.visitsProviderMap.set(provider.descriptor.key, provider);
    }

    for (const provider of registrationsProviders) {
      this.registrationsProviderMap.set(provider.descriptor.key, provider);
    }
  }

  public getVisitsProvider(key: string): VisitsProvider {
    const provider = this.visitsProviderMap.get(key);

    if (!provider) {
      throw new AppError({
        message: `Visits provider ${key} is not registered`,
        code: "VISITS_PROVIDER_NOT_FOUND",
        statusCode: 400,
      });
    }

    return provider;
  }

  public getRegistrationsProvider(key: string): RegistrationsProvider {
    const provider = this.registrationsProviderMap.get(key);

    if (!provider) {
      throw new AppError({
        message: `Registrations provider ${key} is not registered`,
        code: "REGISTRATIONS_PROVIDER_NOT_FOUND",
        statusCode: 400,
      });
    }

    return provider;
  }

  public listProviders(): ProviderDescriptor[] {
    return [
      ...this.visitsProviderMap.values(),
      ...this.registrationsProviderMap.values(),
    ]
      .map((provider) => provider.descriptor)
      .sort((left, right) => left.key.localeCompare(right.key));
  }
}

export const providerRegistry = new ProviderRegistryService();
