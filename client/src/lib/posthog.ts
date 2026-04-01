import posthog from "posthog-js";

const key = import.meta.env.VITE_POSTHOG_KEY ?? "";
if (key) {
  posthog.init(key, {
    api_host: "https://app.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage",
    autocapture: {
      dom_event_allowlist: ['click'],
      element_allowlist: ['a', 'button', 'input', 'select', 'textarea'],
    },
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing();
    },
  });
}

export { posthog };
