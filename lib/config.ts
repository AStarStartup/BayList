/**
 * Store configuration for generated listing copy.
 *
 * Public store details live in `public/config.json` (statically served, so
 * the same build works for every deployment). Edit that file to change the
 * store name, contact line, payment handle, or shipping policy.
 */

export interface StoreConfig {
  StoreName?: string;
  ContactLine?: string;
  PaymentHandle?: string;
  ShippingPolicy?: string;
  Location?: string;
}

const defaults: StoreConfig = {
  StoreName: "BayList",
  ContactLine: "",
  PaymentHandle: "",
  ShippingPolicy: "Fast shipping with tracking. Local pickup available.",
};

let cache: StoreConfig | null = null;
let pending: Promise<StoreConfig> | null = null;

/** Load store config from /config.json; falls back to safe defaults. */
export function loadStoreConfig(): Promise<StoreConfig> {
  if (cache) return Promise.resolve(cache);
  if (pending) return pending;

  pending = fetch("/config.json", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : defaults))
    .catch(() => defaults)
    .then((parsed: StoreConfig) => {
      cache = { ...defaults, ...parsed };
      return cache;
    });

  return pending;
}
