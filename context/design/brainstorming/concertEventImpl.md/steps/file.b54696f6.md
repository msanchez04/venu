---
timestamp: 'Fri Oct 17 2025 09:47:11 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_094711.bfb6b9f0.md]]'
content_id: b54696f6859f4089dcdb32eddf4603c86c487a37ad6c11c6a62423a63e650fbf
---

# file: src/ConcertEvent/ConcertEventConcept.ts

Here is the TypeScript implementation for the `ConcertEventConcept`. It includes the necessary MongoDB interactions, type definitions, and action methods as specified.

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "../utils/types.ts"; // Assuming types are in a utils folder
import { freshID } from "../utils/database.ts"; // Assuming freshID is in a utils folder

// =================================================================================================
// CONCEPT: ConcertEvent
// PURPOSE: Represents a single concert that a user attended, serving as the hub for related data.
// =================================================================================================

// Define generic type parameters from the concept spec
type User = ID;
type Artist = ID; // Note: We treat Artist as an ID, assuming an Artist concept may exist elsewhere.

// Define a constant for the collection prefix to avoid naming collisions
const PREFIX = "ConcertEvent";

/**
 * Represents the state for a single concert event stored in the database.
 * Corresponds to: "a set of ConcertEvents with..."
 */
export interface ConcertEventDoc {
  _id: ID; // concertID
  owner: User;
  artist: Artist;
  date: Date;
  venue: string;
  city: string;
  rating?: number; // Optional as per spec
}

export default class ConcertEventConcept {
  private readonly concertEvents: Collection<ConcertEventDoc>;

  constructor(db: Db) {
    this.concertEvents = db.collection<ConcertEventDoc>(`${PREFIX}.concerts`);
  }

  /**
   * Creates a new concert event record for a user.
   * @param user The ID of the user who attended the concert.
   * @param artist The ID of the artist who performed.
   * @param date The date of the concert.
   * @param venue The name of the venue.
   * @param city The city where the concert took place.
   * @returns The newly created concert document or an error object.
   */
  async addConcert({ user, artist, date, venue, city }: { user: User; artist: Artist; date: Date; venue: string; city: string }): Promise<{ concert: ConcertEventDoc } | { error: string }> {
    // REQUIRES: no ConcertEvent exists for (user, artist, date, venue)
    const existingConcert = await this.concertEvents.findOne({
      owner: user,
      artist,
      date: new Date(date), // Ensure date is compared correctly
      venue,
    });

    if (existingConcert) {
      return { error: "A concert with these details already exists for this user." };
    }

    // EFFECT: creates and saves a new ConcertEvent linked to the user
    const newConcert: ConcertEventDoc = {
      _id: freshID(),
      owner: user,
      artist,
      date: new Date(date),
      venue,
      city,
    };

    const result = await this.concertEvents.insertOne(newConcert);
    if (!result.acknowledged) {
      return { error: "Failed to add concert to the database." };
    }

    return { concert: newConcert };
  }

  /**
   * Updates the details of an existing concert event.
   * @param concert The ID of the concert to edit.
   * @param newArtist (Optional) The new artist ID.
   * @param newDate (Optional) The new date for the concert.
   * @param newVenue (Optional) The new venue name.
   * @param newCity (Optional) The new city name.
   * @returns An empty object on success or an error object.
   */
  async editConcertDetails({ concert, newArtist, newDate, newVenue, newCity }: { concert: ID; newArtist?: Artist; newDate?: Date; newVenue?: string; newCity?: string }): Promise<Empty | { error: string }> {
    // REQUIRES: concert exists
    const doesExist = await this.concertEvents.findOne({ _id: concert });
    if (!doesExist) {
      return { error: `Concert with ID '${concert}' not found.` };
    }

    // EFFECT: updates any specified concert details
    const updates: Partial<Omit<ConcertEventDoc, "_id" | "owner">> = {};
    if (newArtist) updates.artist = newArtist;
    if (newDate) updates.date = new Date(newDate);
    if (newVenue) updates.venue = newVenue;
    if (newCity) updates.city = newCity;

    // Prevent an empty update operation
    if (Object.keys(updates).length === 0) {
      return { error: "No details provided to update." };
    }

    const result = await this.concertEvents.updateOne({ _id: concert }, { $set: updates });

    if (result.matchedCount === 0) {
      // This case should be rare due to the check above, but it's good practice
      return { error: "Failed to find the concert to update." };
    }

    return {};
  }
}
```

### Explanation and Key Implementation Details

1. **File Structure and Naming**: The file is named `ConcertEventConcept.ts` and placed in a `src/ConcertEvent/` directory, following the standard modular structure.
2. **State Mapping**: The `state` from your spec is mapped to the `ConcertEventDoc` TypeScript interface. `concertID` becomes the MongoDB `_id` field. The `rating` field is marked as optional (`?`) to match the spec.
3. **Generic Parameters (`User`, `Artist`)**: These are defined as type aliases for `ID`. This keeps the implementation clean and aligned with the concept's polymorphic design. It assumes that `User` and `Artist` identifiers will be provided by other concepts (like `UserAccount`).
4. **Constructor and Collection**: The constructor takes a `Db` instance and initializes a MongoDB collection named `ConcertEvent.concerts`. The `PREFIX` ensures that if other concepts also have a `concerts` collection, they won't clash.
5. **`addConcert` Action**:
   * **Requirement Check**: It first performs a `findOne` query to ensure no concert with the same unique combination of `owner`, `artist`, `date`, and `venue` already exists, fulfilling the `requires` clause.
   * **Effect**: If the requirement is met, it creates a new document object, generates a unique ID using `freshID()`, and inserts it into the database. It then returns the newly created concert object, as specified by `(concert: ConcertEvent)`.
6. **`editConcertDetails` Action**:
   * **Requirement Check**: It first checks if a concert with the given `concert` ID exists.
   * **Effect**: It dynamically builds an `updates` object containing only the fields that were provided as arguments. This prevents accidentally overwriting existing data with `undefined`. It then uses MongoDB's `$set` operator to apply these partial updates.
7. **Asynchronous Operations**: All methods that interact with the database are marked `async` and return a `Promise`. This is standard for modern I/O operations in JavaScript/TypeScript.
8. **Error Handling**: Instead of throwing exceptions for predictable failures (like a duplicate entry or a non-existent document), the methods return an object with an `error` key, as instructed. This allows for cleaner integration with synchronizations later.
9. **Date Handling**: Incoming date strings or objects are wrapped in `new Date(...)` to ensure they are stored and compared consistently as BSON Date types in MongoDB.
