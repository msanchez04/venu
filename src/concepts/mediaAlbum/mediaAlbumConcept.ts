import { Collection, Db } from "mongodb";
import { Empty, ID } from "../../utils/types.ts";
import { freshID } from "../../utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "MediaAlbum" + ".";

// Generic types used by this concept (external IDs)
type User = ID;
type ConcertEvent = ID;

/**
 * A MediaFileEntry is an object with details about a single media file
 * (e.g., photo or video) stored within an album.
 * The actual file content is assumed to be stored externally (e.g., cloud storage)
 * and referenced by its URL.
 */
interface MediaFileEntry {
  id: ID; // Unique identifier for this media item
  url: string; // URL or path to the media file
  uploadTimestamp: Date; // When the media item was uploaded
  type: "photo" | "video"; // e.g., "photo", "video"
}

/**
 * Represents a single MediaAlbum document in the database.
 * a set of MediaAlbums with
 *   albumID ID
 *   owner User
 *   concert ConcertEvent
 *   mediaItems Set of MediaFileEntry
 *   createdAt DateTime
 */
interface MediaAlbumDoc {
  _id: ID; // albumID
  owner: User;
  concert: ConcertEvent;
  mediaItems: MediaFileEntry[];
  createdAt: Date;
}

export default class MediaAlbumConcept {
  private mediaAlbums: Collection<MediaAlbumDoc>;

  constructor(private readonly db: Db) {
    this.mediaAlbums = this.db.collection<MediaAlbumDoc>(
      PREFIX + "mediaAlbums",
    );
  }

  /**
   * createAlbum (user: User, concert: ConcertEvent): (album: MediaAlbum)
   *
   * requires: no album exists for (user, concert)
   *           (The existence of the concert is assumed to be checked by a sync that calls this action)
   * effect: creates a new MediaAlbum linked to the concert and owned by the user,
   *         with an empty set of mediaItems and current time as createdAt.
   */
  async createAlbum({
    user,
    concert,
  }: {
    user: User;
    concert: ConcertEvent;
  }): Promise<{ album: ID } | { error: string }> {
    // Check precondition: no album exists for (user, concert)
    const existingAlbum = await this.mediaAlbums.findOne({
      owner: user,
      concert: concert,
    });
    if (existingAlbum) {
      return { error: "Album for this user and concert already exists." };
    }

    const newAlbumId = freshID();
    const newAlbum: MediaAlbumDoc = {
      _id: newAlbumId,
      owner: user,
      concert: concert,
      mediaItems: [],
      createdAt: new Date(),
    };

    try {
      await this.mediaAlbums.insertOne(newAlbum);
      return { album: newAlbumId };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Failed to create album: ${message}`);
      return { error: "Failed to create album due to a database error." };
    }
  }

  /**
   * uploadMedia (user: User, album: MediaAlbum, url: String, uploadTimestamp: DateTime, type: String): Empty | (error: String)
   *
   * requires: album exists and album.owner = user
   * effect: adds a new MediaFileEntry (with a fresh ID, the provided URL, uploadTimestamp, and type)
   *         to the specified album's `mediaItems` set.
   */
  async uploadMedia({
    user,
    album,
    url,
    uploadTimestamp,
    type,
  }: {
    user: User;
    album: ID;
    url: string;
    uploadTimestamp: Date;
    type: "photo" | "video";
  }): Promise<Empty | { error: string }> {
    // Check precondition: album exists
    const existingAlbum = await this.mediaAlbums.findOne({ _id: album });
    if (!existingAlbum) {
      return { error: "Media album not found." };
    }

    // Check precondition: album.owner = user
    if (existingAlbum.owner !== user) {
      return { error: "User is not the owner of this album." };
    }

    const newMediaFile: MediaFileEntry = {
      id: freshID(), // Generate a unique ID for the media item
      url: url,
      uploadTimestamp: uploadTimestamp,
      type: type,
    };

    try {
      await this.mediaAlbums.updateOne(
        { _id: album },
        { $push: { mediaItems: newMediaFile } },
      );
      return {}; // Success, no specific result to return
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Failed to upload media: ${message}`);
      return { error: "Failed to upload media due to a database error." };
    }
  }

  // --- Queries (examples) ---

  /**
   * _getMediaAlbum (album: MediaAlbum): (album: MediaAlbumDoc) | (error: String)
   *
   * effects: Returns the full MediaAlbum document for the given ID.
   */
  async _getMediaAlbum({
    album,
  }: {
    album: ID;
  }): Promise<{ album: MediaAlbumDoc } | { error: string }> {
    const foundAlbum = await this.mediaAlbums.findOne({ _id: album });
    if (!foundAlbum) {
      return { error: "Media album not found." };
    }
    return { album: foundAlbum };
  }

  /**
   * _getAlbumsByUserAndConcert (user: User, concert: ConcertEvent): (albums: MediaAlbumDoc[])
   *
   * effects: Returns all media albums for a specific user and concert.
   */
  async _getAlbumsByUserAndConcert({
    user,
    concert,
  }: {
    user: User;
    concert: ConcertEvent;
  }): Promise<{ albums: MediaAlbumDoc[] }> {
    const foundAlbums = await this.mediaAlbums
      .find({ owner: user, concert: concert })
      .toArray();
    return { albums: foundAlbums };
  }
}
