# Pagination and Large Data Volumes

**Rule:** When using List Rows (Dataverse), Get Items (SharePoint), or similar list actions,
never leave them to "get everything" by default. Set an explicit **Top Count**, and turn on
**Pagination** with a sensible **Threshold**.

**Why:** An unbounded list action will attempt to return every record, which can time out or
fail outright as the underlying table/list grows — an easy way for a flow to work fine in
testing and quietly break in production months later.

**For genuinely large volumes:** Consider a paged loop using a skiptoken/paging cursor rather
than trying to retrieve everything in a single action.

**Document expected volume:** Note, in the action or flow description, roughly how many
records are expected. This lets a future maintainer know when it's time to revisit the
pagination settings as data grows.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| List Rows – List Active Accounts, Top Count 500, Pagination On, Threshold 5000 | Explicit limit, with room to grow via pagination | List Rows – List Active Accounts, no Top Count set | Attempts to return every record, unbounded, can time out as the table grows |
| Get Items – Get Open Requests, note added stating "expected ~200 rows/day" | Future maintainers know expected volume and when to revisit settings | Get Items – Get Open Requests, no indication of expected volume | No way to tell if current settings are still appropriate as data grows |
