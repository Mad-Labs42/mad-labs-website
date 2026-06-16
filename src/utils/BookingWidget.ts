/**
 * BookingWidget.ts — Booking service configuration and URL resolution.
 *
 * Pure module: resolves a booking action (data-tablet-action value) into
 * a Nimbuspop/Zoho embed configuration. Has zero DOM dependencies.
 *
 * The actual config values come from the server-rendered <script id="tablet-config">
 * tag in ContactTablet.astro. This module provides the shape and resolver.
 */

export interface BookingConfig {
  zohoUrl: string;
  nimbuspopScriptSrc: string;
}

/**
 * Resolves a booking action string into a Nimbuspop embed URL.
 * Currently supports one booking type (Zoho Bookings free plan limitation).
 *
 * @param action — the data-tablet-action value from the clicked button
 * @param config — the parsed tablet config from the server-rendered JSON script tag
 * @returns the resolved Zoho embed URL, or null if the action is unknown
 */
export function resolveBookingUrl(action: string, config: BookingConfig): string | null {
  // Single booking type — always uses the configured Zoho URL
  // Future: when the Zoho plan allows multiple types, extend this
  // to map actions to different URLs
  void action;
  return config.zohoUrl;
}

/**
 * Returns the Nimbuspop embed script source URL from the config.
 */
export function getNimbuspopScriptSrc(config: BookingConfig): string {
  return config.nimbuspopScriptSrc;
}
