import { assertEquals, assertExists } from "@std/assert";
import { Db, MongoClient } from "mongodb";
import { ID } from "@utils/types.ts";
import { testDb } from "@utils/database.ts";
import UserAccountConcept from "@concepts/userAccount.ts";

Deno.test("UserAccountConcept Suite", async (t) => {
  // Initialize a single connection for the entire test suite
  let db: Db;
  let client: MongoClient;
  let userAccount: UserAccountConcept;

  // Setup: Create a single connection for all tests
  await t.step("Setup: Initialize database connection", async () => {
    [db, client] = await testDb();
    userAccount = await UserAccountConcept.initialize(db);
    // Always clean the UserAccount collection for test isolation
    await db.collection("UserAccount.users").deleteMany({});
  });

  await t.step(
    "Operational Principle: should successfully register a new user and allow them to log in",
    async () => {
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
    }
  );

  await t.step(
    "Variant: should fail to register a user with a duplicate email",
    async () => {
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
      console.log(
        "--> Action: register (second time with same email)",
        secondRegistration
      );
      const result = await userAccount.register(secondRegistration);
      console.log("<-- Result:", result);

      assertEquals(result, {
        error: "A user with this email already exists.",
      });
    }
  );

  await t.step(
    "Variant: should fail to log in with an incorrect password",
    async () => {
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
      console.log("--> Action: login", loginDetails);
      const result = await userAccount.login(loginDetails);
      console.log("<-- Result:", result);

      assertEquals(result, { success: false });
    }
  );

  await t.step(
    "Variant: should fail to log in with a non-existent email",
    async () => {
      console.log("\nTEST: Variant - Login with Non-existent Email");

      const loginDetails = {
        email: "nobody@example.com",
        password: "any_password",
      };
      console.log("--> Action: login", loginDetails);
      const result = await userAccount.login(loginDetails);
      console.log("<-- Result:", result);

      assertEquals(result, { success: false });
    }
  );

  // Cleanup: Close the database connection after all tests
  await t.step("Cleanup: Close database connection", async () => {
    await client.close();
  });
});
