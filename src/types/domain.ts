export interface UTMFields {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
}

export type TrackingEventKind = "visit" | "registration";

export interface RawVisitMetric {
  rawRoute: string | null | undefined;
  rawUrl: string | null | undefined;
  visits: number;
  utms: Record<string, unknown> | undefined;
  capturedAt: string | undefined;
  dateBucket: string | undefined;
  source: string;
  metadata: Record<string, unknown> | undefined;
}

export interface RawRegistrationMetric {
  rawRoute: string | null | undefined;
  rawUrl: string | null | undefined;
  registrations: number;
  utms: Record<string, unknown> | undefined;
  capturedAt: string | undefined;
  dateBucket: string | undefined;
  source: string;
  metadata: Record<string, unknown> | undefined;
}

export interface NormalizedMetricRecord extends UTMFields {
  siteKey: string;
  route: string;
  visits: number;
  registrations: number;
  source: string;
  capturedAt: string;
  dateBucket: string;
  metadata?: Record<string, unknown>;
}

export interface TrafficRecord extends UTMFields {
  siteKey: string;
  route: string;
  visits: number;
  registrations: number;
  source: string[];
  capturedAt: string;
  dateBucket: string;
  syncKey: string;
}

export interface TrackingEventPayload extends Partial<UTMFields> {
  siteKey: string;
  route: string | null | undefined;
  url: string | null | undefined;
  eventId: string | undefined;
  kind: TrackingEventKind;
  increment: number;
  source: string;
  capturedAt: string | undefined;
  dateBucket: string | undefined;
  utms: Record<string, unknown> | undefined;
  metadata: Record<string, unknown> | undefined;
}

export interface NormalizedTrackingEvent extends UTMFields {
  siteKey: string;
  route: string;
  kind: TrackingEventKind;
  increment: number;
  visitsDelta: number;
  registrationsDelta: number;
  source: string;
  capturedAt: string;
  dateBucket: string;
  syncKey: string;
  eventId: string | undefined;
  metadata: Record<string, unknown> | undefined;
}
