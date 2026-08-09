# Pagination and Large Data Volumes

**Rule:** When using List Rows (Dataverse), Get Items (SharePoint), or similar list actions,
never leave them to "get everything" by default without a conscious decision. Set an explicit
**Top Count**, and turn on **Pagination** with a sensible **Threshold** whenever the result set
could realistically grow.

**Why:** An unbounded list action will attempt to return every record, which can time out or
fail outright as the underlying table/list grows — an easy way for a flow to work fine in
testing and quietly break in production months later.

**Agent behaviour — ask before assuming volume:** Don't silently turn on Pagination/Top Count,
and don't silently leave them off. Ask the user (or infer from context, e.g. a static
reference list vs. a transactional table) whether the source is expected to stay small and
bounded, or could grow into the hundreds/thousands of rows over time:
- If the result set is genuinely small and bounded by nature (e.g. a fixed lookup list of a
  dozen categories), it's fine to leave Pagination off and use a small Top Count — but say so,
  so the decision is visible rather than an oversight.
- If large or unbounded volumes are expected, or the user isn't sure, configure Top Count and
  Pagination with a sensible Threshold as the default, and document the expected volume (see
  below).

**For genuinely large volumes:** Consider a paged loop using a skiptoken/paging cursor rather
than trying to retrieve everything in a single action.

**Document expected volume:** Note, in the action or flow description, roughly how many
records are expected. This lets a future maintainer know when it's time to revisit the
pagination settings as data grows.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| List Rows – List Active Accounts, Top Count 500, Pagination On, Threshold 5000 | Explicit limit, with room to grow via pagination | List Rows – List Active Accounts, no Top Count set | Attempts to return every record, unbounded, can time out as the table grows |
| Get Items – Get Open Requests, note added stating "expected ~200 rows/day" | Future maintainers know expected volume and when to revisit settings | Get Items – Get Open Requests, no indication of expected volume | No way to tell if current settings are still appropriate as data grows |
