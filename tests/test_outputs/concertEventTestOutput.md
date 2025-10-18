Tested the creation of a concert event (8 steps each step considered a test case)
Tested:
- Adding concert
- Editing concert details
- Duplicate concert error
## Complete console output

```
Task test deno test --allow-net --allow-env --allow-read --allow-sys "./tests/concertEvent.test.ts"
running 1 test from ./tests/concertEvent.test.ts
ConcertEventConcept Suite ...
  Setup: Initialize database connection ... ok (775ms)
  Operational Principle: should successfully add a concert and then edit its details ...
------- output -------
TEST: Operational Principle - Add Concert and Edit Details
--> Action: addConcert {
  user: "user:alice",
  artist: "artist:radiohead",
  date: 2024-06-15T20:00:00.000Z,
  venue: "Madison Square Garden",
  city: "New York"
}
<-- Result: {
  concert: {
    _id: "7995ee8e-bde0-456e-babe-15a37cecddc5",
    owner: "user:alice",
    artist: "artist:radiohead",
    date: 2024-06-15T20:00:00.000Z,
    venue: "Madison Square Garden",
    city: "New York"
  }
}
--> Action: editConcertDetails {
  concert: "7995ee8e-bde0-456e-babe-15a37cecddc5",
  newArtist: "artist:arcadefire",
  newDate: 2024-06-20T19:30:00.000Z,
  newVenue: "Barclays Center",
  newCity: "Brooklyn"
}
<-- Result: {}
----- output end -----
  Operational Principle: should successfully add a concert and then edit its details ... ok (100ms)
  Variant: should fail to add duplicate concert (same user, artist, date, venue) ...
------- output -------

TEST: Variant - Duplicate Concert Prevention
--> Action: addConcert (first time) {
  user: "user:bob",
  artist: "artist:beatles",
  date: 2024-07-04T21:00:00.000Z,
  venue: "Fenway Park",
  city: "Boston"
}
<-- Result: {
  concert: {
    _id: "38435fd2-37fd-4841-bf2a-6981d01a29f5",
    owner: "user:bob",
    artist: "artist:beatles",
    date: 2024-07-04T21:00:00.000Z,
    venue: "Fenway Park",
    city: "Boston"
  }
}
--> Action: addConcert (duplicate) {
  user: "user:bob",
  artist: "artist:beatles",
  date: 2024-07-04T21:00:00.000Z,
  venue: "Fenway Park",
  city: "Different City"
}
<-- Result: { error: "A concert with these details already exists for this user." }
----- output end -----
  Variant: should fail to add duplicate concert (same user, artist, date, venue) ... ok (53ms)
  Variant: should fail to edit non-existent concert ...
------- output -------

TEST: Variant - Edit Non-existent Concert
--> Action: editConcertDetails { concert: "concert:nonexistent", newVenue: "Some Venue" }
<-- Result: { error: "Concert with ID 'concert:nonexistent' not found." }
----- output end -----
  Variant: should fail to edit non-existent concert ... ok (18ms)
  Variant: should fail to edit concert with no updates provided ...
------- output -------

TEST: Variant - Edit Concert with No Updates
--> Action: addConcert {
  user: "user:charlie",
  artist: "artist:nirvana",
  date: 2024-08-10T20:30:00.000Z,
  venue: "Red Rocks",
  city: "Denver"
}
<-- Result: {
  concert: {
    _id: "9b615039-a7b1-4f0e-8925-7e1bb96f9cdb",
    owner: "user:charlie",
    artist: "artist:nirvana",
    date: 2024-08-10T20:30:00.000Z,
    venue: "Red Rocks",
    city: "Denver"
  }
}
--> Action: editConcertDetails (no updates) { concert: "9b615039-a7b1-4f0e-8925-7e1bb96f9cdb" }
<-- Result: { error: "No details provided to update." }
----- output end -----
  Variant: should fail to edit concert with no updates provided ... ok (52ms)
  Variant: should allow same user to add different concerts ...
------- output -------

TEST: Variant - Same User, Different Concerts
--> Action: addConcert (first) {
  user: "user:diana",
  artist: "artist:ledzeppelin",
  date: 2024-09-15T19:00:00.000Z,
  venue: "Hollywood Bowl",
  city: "Los Angeles"
}
<-- Result: {
  concert: {
    _id: "a58ca1cc-dd66-42f0-bbc6-4f512e6372fd",
    owner: "user:diana",
    artist: "artist:ledzeppelin",
    date: 2024-09-15T19:00:00.000Z,
    venue: "Hollywood Bowl",
    city: "Los Angeles"
  }
}
--> Action: addConcert (second) {
  user: "user:diana",
  artist: "artist:pinkfloyd",
  date: 2024-09-20T20:00:00.000Z,
  venue: "Hollywood Bowl",
  city: "Los Angeles"
}
<-- Result: {
  concert: {
    _id: "33b9f4dd-9ec2-4bf9-958b-54da82a3dbcc",
    owner: "user:diana",
    artist: "artist:pinkfloyd",
    date: 2024-09-20T20:00:00.000Z,
    venue: "Hollywood Bowl",
    city: "Los Angeles"
  }
}
----- output end -----
  Variant: should allow same user to add different concerts ... ok (74ms)
  Variant: should successfully edit only some concert fields ...
------- output -------

TEST: Variant - Partial Concert Edit
--> Action: addConcert {
  user: "user:eve",
  artist: "artist:metallica",
  date: 2024-10-05T21:00:00.000Z,
  venue: "Wembley Stadium",
  city: "London"
}
<-- Result: {
  concert: {
    _id: "e7b43775-45be-4c39-ad09-b254bcaae09e",
    owner: "user:eve",
    artist: "artist:metallica",
    date: 2024-10-05T21:00:00.000Z,
    venue: "Wembley Stadium",
    city: "London"
  }
}
--> Action: editConcertDetails (partial) {
  concert: "e7b43775-45be-4c39-ad09-b254bcaae09e",
  newVenue: "O2 Arena",
  newCity: "London"
}
<-- Result: {}
----- output end -----
  Variant: should successfully edit only some concert fields ... ok (75ms)
  Cleanup: Close database connection ... ok (3ms)
ConcertEventConcept Suite ... ok (1s)

ok | 1 passed (8 steps) | 0 failed (1s)
```
