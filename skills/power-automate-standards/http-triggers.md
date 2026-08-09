# HTTP Triggered Flows

**Rule:** Set trigger-level authentication as the first line of defence, before adding any
custom validation logic inside the flow. The "When an HTTP request is received" trigger
supports three modes:

1. **Any user in my tenant** *(default)* — only requests with a valid bearer token for your
   own tenant can trigger the flow.
2. **Specific users in my tenant** — restrict further to named users or service principal
   object IDs. Use this when only one or two known systems/accounts should ever call this flow.
3. **Anyone** — legacy behaviour, no built-in authentication. Treat this as an exception, only
   for calling systems that genuinely can't send a bearer token (e.g. a third-party webhook
   using a shared secret instead).

Where the caller is another Entra ID registered app/service capable of obtaining a token,
prefer mode 1 or 2 over building custom validation — it's enforced before the flow even starts,
rather than being a Condition someone has to remember to add and maintain.

## Request body schema

**Rule:** Regardless of authentication mode, always set a proper JSON schema for the Request
Body — don't leave it wide open, and don't just generate it once from a sample and forget it.

**Why:** Power Automate validates the incoming request against this schema before any action
runs, rejecting a malformed/unexpected payload immediately rather than causing a confusing
failure partway through the flow. This is free, built-in, and checks *shape only* — it does
not check *who* sent the request or whether it's genuine, so it complements but never replaces
the authentication settings above.

## When the trigger must stay on "Anyone"

For callers that can't authenticate via bearer token, protect the flow yourself using one or
more of:

- **A shared secret** in a header or query string, checked with a Condition before the flow
  does anything else.
- **Signature validation** (HMAC), if the caller supports it (e.g. `X-Hub-Signature-256`).
  Power Automate has no native action for this — the standard approach is a small Azure
  Function that recomputes the hash and returns a match/no-match result, called from a
  Condition near the start of the flow, terminating the run if it fails. This proves the
  payload wasn't tampered with in transit, which authentication alone doesn't cover.
- **IP restrictions** — not a setting on the trigger itself. Requires something in front of the
  flow (Azure API Management or Front Door) configured to only forward allowed source IPs.
  Worthwhile as a shared choke point across multiple flows/APIs, but it's extra Azure
  infrastructure to build and maintain, not a checkbox.

Whichever approach is used, note it (and why) in the flow's description — including if the
trigger is intentionally on "Anyone" and what's compensating for it. If using a shared secret,
rotate it periodically, same as any other credential (see
[ownership-and-connections.md](ownership-and-connections.md)).

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| HTTP trigger: Specific users in my tenant, listing the calling service principal's object ID, with a defined request body schema | Only the intended caller can trigger it, enforced by the platform; malformed requests rejected up front | HTTP trigger on Anyone, no other validation, caller is a first-party Entra ID app that could have authenticated | Misses out on free, platform-enforced authentication for no reason |
| HTTP trigger on Anyone (third-party webhook, can't send a bearer token), signature check against a shared secret in an early Condition, noted in the description | Deliberate, documented compensating control, confirms payload is genuine | HTTP trigger on Anyone with no validation, relying only on the URL being hard to guess | Anyone who obtains the URL can trigger the flow with any payload |
| Webhook endpoint restricted to known caller IPs via API Management in front of the flow | Requests outside the expected source are rejected before reaching the flow | HTTP trigger URL shared directly, no schema, no way to restrict caller | No control over who can call it or what they send |
