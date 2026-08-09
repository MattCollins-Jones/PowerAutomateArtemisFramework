# Ownership, Service Accounts, Service Principals & Connection References

## Flow ownership

**Rule:** Business-critical flows should be owned by a Service Account or Service Principal
(application user), never by a named user account.

**Why:** Named-user-owned flows break (or need manual re-ownership) when that person leaves
the organisation — an avoidable administrative burden.

**Licensing/architecture guidance:**
- A Service Principal (application user) owning a flow requires a Power Automate **Process**
  license, since there's no licensed user behind it — but it supports a higher per-flow API
  throughput.
- Flows running in the context of a licensed Dynamics 365 (Enterprise/Professional) app can be
  owned by a Service Principal without needing an extra Process license, and get a higher API
  limit.
- For most orgs with Power Apps Premium broadly licensed: have a **Service Account own the
  flow** (so it runs under the app's license), while **connections inside the flow use Service
  Principals** where the connector supports them (e.g. Dataverse does; SharePoint does not).
  This is more secure than a plain user connection and unaffected by MFA prompts, while still
  running under the app's license.
- Large/enterprise orgs where API throttling is a real concern, and cost is not, should favour
  Service Principals owning both the flow and its connections, backed by Process licensing.
- Where some connectors in a flow support Service Principals and some don't, a Service
  Account-only approach for that flow may be the simplest consistent option.

This is guidance, not a hard rule — always validate licensing/architecture decisions against
current Microsoft guidance or a partner, especially for larger deployments.

## Naming Service Principals & Service Accounts

**Rule:** Name Service Principals as `SvPr-<System>-<App/Area>`, adding a business area/region
segment for larger orgs. Name Service Accounts descriptively enough to identify the business
unit and technology, without going so granular it becomes project-specific noise.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| `SvPr-Dataverse-Event` | Identifies system (Dataverse) and app (Events) | `SvPr-Dataverse` | Doesn't identify which app/environment this is for |
| `SvPr-Dataverse-HO-Asset` | Adds business area (Head Office) for larger orgs | `SvPr-DV-HO-ASS` | Overly acronym-heavy, hard to decipher |
| `SvAcc-UKSales PPAdmin` | Identifies account type and business unit | `Service-Account Admin` | Generic, no technology or business unit |
| `SvAcc-UK D365 Admin` | Identifies business unit and technology | `SvAcc-UKSales TimeSheet Proj - PPAdmin` | Too project-specific, avoid this level of detail |

## Connection References

**Rule:** Always use Connection References over raw Connections when building flows destined
for a solution. Name them the same way as Service Principals/Accounts above, plus a
project/solution identifier.

**Why:** A Connection Reference lets a flow point at a connection without embedding
credentials in the flow itself. On deployment to another environment (UAT/Test/Pre-Prod/Prod)
you're prompted to create or select the right connection there — keeping environments cleanly
separated. Flows built inside a solution use Connection References by default; flows outside a
solution use raw Connections and must be converted when moved into one.

Separating Connection References by project (rather than sharing one broadly) helps narrow
down troubleshooting — e.g. an audit log entry showing unexpected writes to a shared table can
be traced to the specific project's connection, not just "some flow, somewhere."

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| `SvPr-Dataverse-Event-2142` | Identifies Service Principal, app, and project number | `SvPr-Dataverse` | No app, environment, or project identifiable |
| `SvAcc-Dataverse-Asset92512` | Identifies account type, technology, and solution/app | `SvAcc-Asset` | No technology identifiable |

Note: Power Automate appends 5 random characters to a Connection Reference name automatically
— leave them or trim them, it has no functional impact.
