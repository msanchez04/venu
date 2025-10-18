---
timestamp: 'Fri Oct 17 2025 08:44:37 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_084437.ef7f903b.md]]'
content_id: c6d6223465181e7a4aad9da82c8caa33242e03892408b276ee5b7c230bce83e4
---

# file: src/userAccount/UserAccountConcept.ts

```typescript
import { Collection, Db, MongoServerError } from "npm:mongodb";

// BEFORE:
// import { ID } from "../utils/types.ts";
// import { freshID } from "../utils/database.ts";

// AFTER:
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";


// ... rest of the UserAccountConcept.ts file
```

By making these changes, you are now consistently using the import map throughout your project. This makes your imports cleaner, avoids complex relative paths like `../../../`, and makes it easier to restructure your project in the future. The `deno(no-local)` error should now be resolved.
