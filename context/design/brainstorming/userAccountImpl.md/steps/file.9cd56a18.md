---
timestamp: 'Fri Oct 17 2025 09:31:50 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_093150.3cb1d7b2.md]]'
content_id: 9cd56a18e71fbc3046fc7829230d4e6dd5699d3d43a8e86ab5f9c8dfeefcdeb9
---

# file: tests/userAccount.test.ts

Here is the corrected and robust version of your test file.

```typescript
import { assertEquals, assertExists } from "jsr:@std/assert";
import { Db, MongoClient } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { testDb } from "@utils/database.ts";
import UserAccountConcept from "@concepts/userAccount.ts";

Deno.test("UserAccountConcept Suite", async (t) => {
  // These are declared here so they are accessible across steps,
  // but they are initialized within each step for isolation.
  let db: Db;
  let client: MongoClient | undefined; // Initialize as potentially undefined

  await t.step(
    "Operational Principle: should successfully register a new user and allow them to log in",
    async () => {
      console.log("TEST: Operational Principle - Register and Login");
      try {
        [db, client] = await testDb();
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
        // THE FIX: Only try to close the client if it was successfully created.
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
        // Apply the same fix here.
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
        // And here.
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
        // And finally, here.
        if (client) {
          await client.close();
        }
      }
    }
  );
});
```

### 2. Find the Real Error

Now, run `deno task test` again. The `TypeError` will be gone. Instead, you will likely see a new, more informative error that comes directly from your `testDb` function. Check for the following common issues:

* **Is your `.env` file in the root directory of your project?** The `deno` command should be run from the same directory that contains your `.env` file.
* **Does your `.env` file contain the correct variable?** It should look exactly like this (with your own connection string): `DB_URI="mongodb+srv://..."`
* **Is your MongoDB connection string correct?** Double-check the username, password, and cluster address for typos.
* **Is your current IP address whitelisted in MongoDB Atlas?** This is a very common reason for connection failures. Go to your Atlas dashboard -> Network Access and ensure your current IP is added.
