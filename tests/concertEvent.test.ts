import { assertEquals, assertExists } from "@std/assert";
import { Db, MongoClient } from "mongodb";
import { ID } from "@utils/types.ts";
import { testDb } from "@utils/database.ts";
import ConcertEventConcept from "@concepts/concertEvent.ts";

Deno.test("ConcertEventConcept Suite", async (t) => {
  // Initialize a single connection for the entire test suite
  let db: Db;
  let client: MongoClient;
  let concertEvent: ConcertEventConcept;

  // Setup: Create a single connection for all tests
  await t.step("Setup: Initialize database connection", async () => {
    [db, client] = await testDb();
    concertEvent = new ConcertEventConcept(db);
    // Always clean the ConcertEvent collection for test isolation
    await db.collection("ConcertEvent.concerts").deleteMany({});
  });

  await t.step(
    "Operational Principle: should successfully add a concert and then edit its details",
    async () => {
      console.log("TEST: Operational Principle - Add Concert and Edit Details");

      const user1 = "user:alice" as ID;
      const artist1 = "artist:radiohead" as ID;
      const concertDate = new Date("2024-06-15T20:00:00Z");
      const venue = "Madison Square Garden";
      const city = "New York";

      const addConcertDetails = {
        user: user1,
        artist: artist1,
        date: concertDate,
        venue,
        city,
      };
      console.log("--> Action: addConcert", addConcertDetails);
      const addResult = await concertEvent.addConcert(addConcertDetails);
      console.log("<-- Result:", addResult);

      assertExists(
        (addResult as { concert: any }).concert,
        "Adding concert should return a concert object"
      );
      const concert = (addResult as { concert: any }).concert;
      const concertId = concert._id;

      // Now edit the concert details
      const editDetails = {
        concert: concertId,
        newArtist: "artist:arcadefire" as ID,
        newDate: new Date("2024-06-20T19:30:00Z"),
        newVenue: "Barclays Center",
        newCity: "Brooklyn",
      };
      console.log("--> Action: editConcertDetails", editDetails);
      const editResult = await concertEvent.editConcertDetails(editDetails);
      console.log("<-- Result:", editResult);

      assertEquals(editResult, {});
    }
  );

  await t.step(
    "Variant: should fail to add duplicate concert (same user, artist, date, venue)",
    async () => {
      console.log("\nTEST: Variant - Duplicate Concert Prevention");

      const user1 = "user:bob" as ID;
      const artist1 = "artist:beatles" as ID;
      const concertDate = new Date("2024-07-04T21:00:00Z");
      const venue = "Fenway Park";
      const city = "Boston";

      const firstConcert = {
        user: user1,
        artist: artist1,
        date: concertDate,
        venue,
        city,
      };
      console.log("--> Action: addConcert (first time)", firstConcert);
      const firstResult = await concertEvent.addConcert(firstConcert);
      console.log("<-- Result:", firstResult);

      // Try to add the same concert again
      const duplicateConcert = {
        user: user1,
        artist: artist1,
        date: concertDate,
        venue,
        city: "Different City", // Different city shouldn't matter
      };
      console.log("--> Action: addConcert (duplicate)", duplicateConcert);
      const duplicateResult = await concertEvent.addConcert(duplicateConcert);
      console.log("<-- Result:", duplicateResult);

      assertEquals(duplicateResult, {
        error: "A concert with these details already exists for this user.",
      });
    }
  );

  await t.step(
    "Variant: should fail to edit non-existent concert",
    async () => {
      console.log("\nTEST: Variant - Edit Non-existent Concert");

      const nonExistentId = "concert:nonexistent" as ID;
      const editDetails = {
        concert: nonExistentId,
        newVenue: "Some Venue",
      };
      console.log("--> Action: editConcertDetails", editDetails);
      const result = await concertEvent.editConcertDetails(editDetails);
      console.log("<-- Result:", result);

      assertEquals(result, {
        error: `Concert with ID '${nonExistentId}' not found.`,
      });
    }
  );

  await t.step(
    "Variant: should fail to edit concert with no updates provided",
    async () => {
      console.log("\nTEST: Variant - Edit Concert with No Updates");

      // First create a concert
      const user1 = "user:charlie" as ID;
      const artist1 = "artist:nirvana" as ID;
      const concertDate = new Date("2024-08-10T20:30:00Z");

      const addConcertDetails = {
        user: user1,
        artist: artist1,
        date: concertDate,
        venue: "Red Rocks",
        city: "Denver",
      };
      console.log("--> Action: addConcert", addConcertDetails);
      const addResult = await concertEvent.addConcert(addConcertDetails);
      console.log("<-- Result:", addResult);

      const concertId = (addResult as { concert: any }).concert._id;

      // Try to edit with no updates
      const editDetails = {
        concert: concertId,
      };
      console.log("--> Action: editConcertDetails (no updates)", editDetails);
      const result = await concertEvent.editConcertDetails(editDetails);
      console.log("<-- Result:", result);

      assertEquals(result, {
        error: "No details provided to update.",
      });
    }
  );

  await t.step(
    "Variant: should allow same user to add different concerts",
    async () => {
      console.log("\nTEST: Variant - Same User, Different Concerts");

      const user1 = "user:diana" as ID;
      const artist1 = "artist:ledzeppelin" as ID;
      const artist2 = "artist:pinkfloyd" as ID;
      const date1 = new Date("2024-09-15T19:00:00Z");
      const date2 = new Date("2024-09-20T20:00:00Z");

      // Add first concert
      const firstConcert = {
        user: user1,
        artist: artist1,
        date: date1,
        venue: "Hollywood Bowl",
        city: "Los Angeles",
      };
      console.log("--> Action: addConcert (first)", firstConcert);
      const firstResult = await concertEvent.addConcert(firstConcert);
      console.log("<-- Result:", firstResult);

      assertExists(
        (firstResult as { concert: any }).concert,
        "First concert should be added successfully"
      );

      // Add second concert with different details
      const secondConcert = {
        user: user1, // Same user
        artist: artist2, // Different artist
        date: date2, // Different date
        venue: "Hollywood Bowl", // Same venue (should be OK)
        city: "Los Angeles", // Same city
      };
      console.log("--> Action: addConcert (second)", secondConcert);
      const secondResult = await concertEvent.addConcert(secondConcert);
      console.log("<-- Result:", secondResult);

      assertExists(
        (secondResult as { concert: any }).concert,
        "Second concert should be added successfully"
      );
    }
  );

  await t.step(
    "Variant: should successfully edit only some concert fields",
    async () => {
      console.log("\nTEST: Variant - Partial Concert Edit");

      // First create a concert
      const user1 = "user:eve" as ID;
      const artist1 = "artist:metallica" as ID;
      const concertDate = new Date("2024-10-05T21:00:00Z");

      const addConcertDetails = {
        user: user1,
        artist: artist1,
        date: concertDate,
        venue: "Wembley Stadium",
        city: "London",
      };
      console.log("--> Action: addConcert", addConcertDetails);
      const addResult = await concertEvent.addConcert(addConcertDetails);
      console.log("<-- Result:", addResult);

      const concertId = (addResult as { concert: any }).concert._id;

      // Edit only venue and city, not artist or date
      const editDetails = {
        concert: concertId,
        newVenue: "O2 Arena",
        newCity: "London", // Same city, different venue
      };
      console.log("--> Action: editConcertDetails (partial)", editDetails);
      const result = await concertEvent.editConcertDetails(editDetails);
      console.log("<-- Result:", result);

      assertEquals(result, {});
    }
  );

  // Cleanup: Close the database connection after all tests
  await t.step("Cleanup: Close database connection", async () => {
    await client.close();
  });
});
