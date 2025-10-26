import { Collection, Db } from "mongodb";
import { Empty, ID } from "../../utils/types.ts";
import { freshID } from "../../utils/database.ts";

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
  async addConcert({
    user,
    artist,
    date,
    venue,
    city,
  }: {
    user: User;
    artist: Artist;
    date: Date;
    venue: string;
    city: string;
  }): Promise<{ concert: ConcertEventDoc } | { error: string }> {
    // REQUIRES: no ConcertEvent exists for (user, artist, date, venue)
    const existingConcert = await this.concertEvents.findOne({
      owner: user,
      artist,
      date: new Date(date), // Ensure date is compared correctly
      venue,
    });

    if (existingConcert) {
      return {
        error: "A concert with these details already exists for this user.",
      };
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
  async editConcertDetails({
    concert,
    newArtist,
    newDate,
    newVenue,
    newCity,
  }: {
    concert: ID;
    newArtist?: Artist;
    newDate?: Date;
    newVenue?: string;
    newCity?: string;
  }): Promise<Empty | { error: string }> {
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

    const result = await this.concertEvents.updateOne(
      { _id: concert },
      { $set: updates },
    );

    if (result.matchedCount === 0) {
      // This case should be rare due to the check above, but it's good practice
      return { error: "Failed to find the concert to update." };
    }

    return {};
  }

  /**
   * Deletes a concert event.
   * @param user The ID of the user (for ownership verification).
   * @param concert The ID of the concert to delete.
   * @returns An empty object on success or an error object.
   */
  async deleteConcert({
    user,
    concert,
  }: {
    user: User;
    concert: ID;
  }): Promise<Empty | { error: string }> {
    // REQUIRES: concert exists and is owned by the user
    const doesExist = await this.concertEvents.findOne({ _id: concert });
    if (!doesExist) {
      return { error: `Concert with ID '${concert}' not found.` };
    }

    // Verify ownership
    if (doesExist.owner !== user) {
      return { error: "User is not the owner of this concert." };
    }

    // Delete the concert
    const result = await this.concertEvents.deleteOne({ _id: concert });

    if (result.deletedCount === 0) {
      return { error: "Failed to delete the concert." };
    }

    return {};
  }

  /**
   * Returns all concerts for a specific user.
   * @param user The ID of the user.
   * @returns An array of concerts owned by the user.
   */
  async _getConcertsByUser(
    { user }: { user: User },
  ): Promise<{ concerts: ConcertEventDoc[] }> {
    const foundConcerts = await this.concertEvents.find({ owner: user })
      .toArray();
    return { concerts: foundConcerts };
  }
}
