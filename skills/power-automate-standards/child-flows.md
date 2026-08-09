# Child Flow Inputs and Outputs

**Rule:** Beyond naming Child flows correctly (see [naming.md](naming.md)), document what a
Child flow expects as input and what it returns as output — particularly for anything
triggered via HTTP or "Run a Child Flow". This doesn't need to be formal: a note in the flow
description, or a short section on the linked ticket/PBI, listing the fields expected in/out,
which are required, and their types, is enough.

**Why:** Saves whoever calls the Child flow from having to open it and reverse-engineer the
schema themselves.

**Breaking changes:** If a Child flow's expected input or output changes in a breaking way,
treat it like any other significant change — bump the version number in the description (see
[flow-documentation.md](flow-documentation.md)) so it's clear to anyone still calling the old
contract that something has changed.
