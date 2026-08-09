# Flow Documentation and Versioning

**Rule:** After creating a flow, and after any significant change, update the flow's
**Description** field with: date, version number, author initials, and a short note of what
was done. Include ticket/PBI references (e.g. `#1234`) where available.

**Format:** `<DD/MM/YY> <Initials> V<major.minor> – <short description> [<ticket refs>]`

**Why:** Gives anyone opening the flow an immediate changelog without digging through version
history or asking the original author.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| `22/12/22 MCJ V1.0 – Initial Release` | Dated, attributed, describes the release | `Today - created flow` | No date, no attribution |
| `15/01/23 MCJ V1.1 - Updated error handling, added notifications #12 #32` | Links to tickets with more detail | *(blank)* | No information at all |

**Notes:**
- Don't do this for every trivial tweak — reserve it for changes that matter, especially
  anything shipping to production.
- The Description field has a character limit. If you hit it, either trim older entries to be
  more succinct, or move version history into a Compose step inside the flow. Be aware a
  Compose step costs an API call on every run — for high-volume flows, prefer trimming the
  description instead.
- If this is a Parent or Child flow, name the other side of the relationship in the
  description, so nobody has to hunt for it.
