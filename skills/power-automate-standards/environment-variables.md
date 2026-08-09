# Environment Variables

**Rule:** Use Environment Variables for configurable data (config values, data source
pointers, non-secret parameters) to support healthy ALM. Never store passwords, API keys, or
other secrets in an Environment Variable directly — use Azure Key Vault (or similar) and, at
most, store the *name* of the key as the Environment Variable value.

**Naming (different from ordinary Variables):** Prefix with a data-type abbreviation, then a
description — the opposite convention to ordinary flow Variables (which always use `var` — see
[variables-and-scopes.md](variables-and-scopes.md)).

**Why the different convention:** Environment Variable values aren't easily visible from
inside a flow (especially once removed from a solution before deployment), so the data-type
prefix helps a maker identify what they're working with without digging into Dataverse tables
or the Default Solution.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| `StrTestEmail` | Identifies data type (String) and purpose | `Email` | Implies but doesn't state the data type or purpose |
| `JSNConfig` | Identifies this as JSON, purpose is config data | `varConfig` | Wrong prefix convention, no data type clarity |

## Consolidating with JSON

**Rule:** Where multiple related config values would otherwise need multiple Environment
Variables, consider a single JSON Environment Variable instead.

Example:
```json
{
  "SendEmail": true,
  "APIVersion": "1.12.3.2",
  "TestEmail": "MCJ@FakeEmail.Com",
  "TestAge": 32,
  "LiveOrTest": "Live"
}
```

Parse the JSON once at the start of the flow (or write a helper expression) rather than
maintaining five separate Environment Variables. To read a single value directly without
parsing first:
```
parameters('JSNObject (mcj_JSNObject)')?['APIVersion']
```
