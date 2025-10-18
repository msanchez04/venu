---
timestamp: 'Fri Oct 17 2025 09:02:38 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_090238.e9f1e2b7.md]]'
content_id: 304dbdc765a87d9a3f3d2136c18943aac1a18528b59687396421c349584d1fb1
---

# file: tests/userAccount.test.ts

(Or `src/userAccount/UserAccountConcept.test.ts`, wherever your test is located)

```typescript
import { assertEquals, assertExists } from "jsr:@std/assert";

// BEFORE (This is what you likely have now, causing the error):
// import { afterAll, beforeEach, describe, it } from "std/testing/bdd.ts";

// AFTER (This is the correct import using JSR):
import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";

import { Db, MongoClient } from "npm:mongodb";
import { getDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserAccountConcept from "../src/userAccount/UserAccountConcept.ts"; // Adjust path if needed

describe("UserAccountConcept", () => {
  let db: Db;
  let client: MongoClient;
  let userAccount: UserAccountConcept;

  beforeEach(async () => {
    [db, client] = await getDb();
    userAccount = new UserAccountConcept(db);
    await db.collection("UserAccount.users").deleteMany({});
  });

  afterAll(async () => {
    await client.close();
  });

  // ... (rest of your test cases are correct and remain the same) ...

  it("Operational Principle: should successfully register a new user and allow them to log in", async () => {
    console.log("TEST: Operational Principle - Register and Login");

    const registrationDetails = {
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    };
    console.log("--> Action: register", registrationDetails);
    const registerResult = await userAccount.register(registrationDetails);
    console.log("<-- Result:", registerResult);

    assertExists(
      (registerResult as { user: ID }).user,
      "Registration should return a user ID"
    );
    const userId = (registerResult as { user: ID }).user;

    const loginDetails = {
      email: "alice@example.com",
      password: "password123",
    };
    console.log("--> Action: login", loginDetails);
    const loginResult = await userAccount.login(loginDetails);
    console.log("<-- Result:", loginResult);

    assertEquals(loginResult, { success: true, user: userId });
  });

  it("Variant: should fail to register a user with a duplicate email", async () => {
    console.log("\nTEST: Variant - Duplicate Email Registration");

    const firstRegistration = {
      name: "Bob",
      email: "bob@example.com",
      password: "password456",
    };
    await userAccount.register(firstRegistration);

    const secondRegistration = {
      name: "Bobby",
      email: "bob@example.com",
      password: "password789",
    };
    const result = await userAccount.register(secondRegistration);

    assertEquals(result, { error: "A user with this email already exists." });
  });

  it("Variant: should fail to log in with an incorrect password", async () => {
    console.log("\nTEST: Variant - Login with Incorrect Password");

    const registrationDetails = {
      name: "Charlie",
      email: "charlie@example.com",
      password: "correct_password",
    };
    await userAccount.register(registrationDetails);

    const loginDetails = {
      email: "charlie@example.com",
      password: "wrong_password",
    };
    const result = await userAccount.login(loginDetails);

    assertEquals(result, { success: false });
  });

  it("Variant: should fail to log in with a non-existent email", async () => {
    console.log("\nTEST: Variant - Login with Non-existent Email");

    const loginDetails = {
      email: "nobody@example.com",
      password: "any_password",
    };
    const result = await userAccount.login(loginDetails);

    assertEquals(result, { success: false });
  });
});
```

With these two changes, your project now correctly defines and uses both the `assert` and `testing` standard libraries via JSR, and the resolver error will be fixed. You can now run your tests with `deno task test`.
