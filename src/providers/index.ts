import { JsonApiRegistrationsProvider } from "./registrations/json-api-registrations.provider";
import { NoopRegistrationsProvider } from "./registrations/noop-registrations.provider";
import { JsonApiVisitsProvider } from "./visits/json-api-visits.provider";
import { NoopVisitsProvider } from "./visits/noop-visits.provider";

export const visitsProviders = [
  new JsonApiVisitsProvider(),
  new NoopVisitsProvider(),
];

export const registrationsProviders = [
  new JsonApiRegistrationsProvider(),
  new NoopRegistrationsProvider(),
];
