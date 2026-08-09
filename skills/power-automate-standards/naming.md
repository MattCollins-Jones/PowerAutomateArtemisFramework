# Naming: Flows, Triggers, Actions, Child Flows

## Flow names

**Rule:** Name a flow `<Trigger Table Name> (CUD) – <Description of flow>`, where `CUD` is
whichever of Create/Update/Delete actually applies (e.g. `(C)`, `(CU)`).

If the trigger isn't a Dataverse table:
- Prefix with the data source, e.g. `EX` (Excel), `SQL`.
- In environments with multiple apps, prefix with an app acronym instead/as well, e.g.
  `EA (CU): Events – ...` for an "Events App".

Child flows must be prefixed `Child - `, e.g. `Child - Retrieve data from API`.

**Why:** Lets any maker scan the flow list and immediately know the trigger table, the CUD
event(s), the data source, and which app it belongs to — without opening the flow.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| `Events (C) – When event created, add to events calendar` | Identifies trigger table, trigger event, and what the flow does | `when a row is created, updated or deleted, add a row` | No trigger table or event identifiable |
| `Manual Trigger – List flows in Environment` | Identifies trigger type and action | `Button->List flows in Environment, Compose` | Poorly formatted; includes irrelevant action detail |
| `EX Forms Response (C) – When response added, email account manager` | Identifies Excel as the data source | `When a Response is added, email account manager` | No data source identified |
| `SQL Scheduled flow – Execute Stored Procedure, get Contacts` | Identifies SQL and schedule cadence up front | `Execute stored procedure, get contacts, do this nightly` | Cadence buried at the end, no data source |
| `EA (CU): Events – When event created or updated, add to events calendar` | `EA` = Events App, plus trigger table | `Events – When event created, add to events calendar` | Table identified but not the app |
| `Child - Retrieve data from API` | Immediately identifiable as a child flow | `Retrieve data from API` | Not distinguishable from a parent flow in a list |

## Trigger names

**Rule:** Rename the trigger to describe *when* the flow fires, including the table/data
type and the CUD action.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| `When an account record is created` | Identifies table + CUD action | `When a row is created, updated or deleted` | Doesn't identify the table |
| `When a new Invoice is uploaded` | Describes the action and document type | `When a file is created in a folder (deprecated)` | Vague, and uses a deprecated trigger |
| `When a contact's telephone number is updated` | Identifies table and column | `Contact Telephone` | Too generic, no CUD action |

## Action names

**Rule:** Rename actions as you create them, keeping a portion of the original action type
name so it's still identifiable, plus what it actually does.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| `List Rows – List Account Records` | Identifies action type and table | `List Rows` | Doesn't identify the table |
| `Get Row – Get Contact Record` | Identifies action type and table | `Find Contact Record` | Loses the action type |
| `Update Row – Update Opportunity record with customer data` | Keeps action type, states table and intent, concise | `Change Opportunity to include Account Number, Telephone Number, address...` | Loses action type, too much detail |

**Note:** Rename actions *while creating them*, not after — if you write a manual expression
and rename the action later, you must update every reference to it manually (dynamic content
references update automatically, but hand-written expressions referencing the action's
internal name do not).

Use Notes (not Comments) on an action to record where else it's used, or to preserve the
original action name if heavily renamed. Comments are Dataverse-table-backed collaboration
artifacts that don't travel with solutions between environments (and require Dataverse);
Notes are part of the flow definition and always travel with it — use Notes for anything a
future maintainer needs to see.
