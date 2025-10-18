---
timestamp: 'Fri Oct 17 2025 09:33:41 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_093341.a4c47a22.md]]'
content_id: 8993725ac04ff857522222bcc6eb6dd5c4b78b182f95513b51194e5b3cc674b8
---

# file: tests/userAccount.test.ts

```typescript
import { assertEquals, assertExists } from "jsr:@std/assert";
import { Db, MongoClient } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { testDb } from "@utils/database.ts";
import UserAccountConcept from "@concepts/userAccount.ts";

Deno.test("UserAccountConcept Suite", async (t) => {
  // These variables are declared in the parent scope to be shared across steps.
  let db: Db;
  let client: MongoClient | undefined;
  // THE FIX: Declare userAccount here so it's visible to all `t.step` blocks.
  let userAccount: UserAccountConcept;

  await t.step(
    "Operational Principle: should successfully register a new user and allow them to log in",
    async () => {
      console.log("TEST: Operational Principle - Register and Login");
      try {
        [db, client] = await testDb();
        // Now this assignment is valid because `userAccount` was declared above.
        userAccount = new UserAccountConcept(db);
        await db.collection("UserAccount.users").deleteMany({});

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
      } finally {
        if (client) {
          await client.close();
        }
      }
    }
  );

  await t.step(
    "Variant: should fail to register a user with a duplicate email",
    async () => {
      console.log("\nTEST: Variant - Duplicate Email Registration");
      try {
        [db, client] = await testDb();
        userAccount = new UserAccountConcept(db);
        await db.collection("UserAccount.users").deleteMany({});

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
        console.log(
          "--> Action: register (second time with same email)",
          secondRegistration
        );
        const result = await userAccount.register(secondRegistration);
        console.log("<-- Result:", result);

        assertEquals(result, { error: "A user with this email already exists." });
      } finally {
        if (client) {
          await client.close();
        }
      }
    }
  );

  await t.step(
    "Variant: should fail to log in with an incorrect password",
    async () => {
      console.log("\nTEST: Variant - Login with Incorrect Password");
      try {
        [db, client] = await testDb();
        userAccount = new UserAccountConcept(db);
        await db.collection("UserAccount.users").deleteMany({});

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
        console.log("--> Action: login", loginDetails);
        const result = await userAccount.login(loginDetails);
        console.log("<-- Result:", result);

        assertEquals(result, { success: false });
      } finally {
        if (client) {
          await client.close();
        }
      }
    }
  );

  await t.step(
    "Variant: should fail to log in with a non-existent email",
    async () => {
      console.log("\nTEST: Variant - Login with Non-existent Email");
      try {
        [db, client] = await testDb();
        userAccount = new UserAccountConcept(db);
        await db.collection("UserAccount.users").deleteMany({});

        const loginDetails = {
          email: "nobody@example.com",
          password: "any_password",
        };
        console.log("--> Action: login", loginDetails);
        const result = await userAccount.login(loginDetails);
        console.log("<-- Result:", result);

        assertEquals(result, { success: false });
      } finally {
        if (client) {
          await client.close();
        }
      }
    }
  );
});
```

With this simple one-line addition, the `Cannot find name 'userAccount'` error will be resolved, and your tests should now execute correctly.
