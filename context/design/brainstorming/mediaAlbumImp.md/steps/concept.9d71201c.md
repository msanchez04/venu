---
timestamp: 'Fri Oct 17 2025 11:24:13 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_112413.f260ca86.md]]'
content_id: 9d71201c37056043c5e00b158a2c0474809aa400213901ecb4042e675a38d071
---

# concept: MediaAlbum

**purpose**
Stores and organizes photos and videos from a concert, separate from the user’s general camera roll.

**principle**
Each concert attended by a user has exactly one MediaAlbum; all photos or videos from that event are stored here.

**state**
a set of MediaAlbums with
  albumID ID
  owner User
  concert ConcertEvent
  mediaItems Set of MediaFileEntry
  createdAt DateTime

// A MediaFileEntry is an object with details about a single media file
// (e.g., photo or video) stored within an album.
// The actual file content is assumed to be stored externally (e.g., cloud storage)
// and referenced by its URL.
a set of MediaFileEntries with
  id ID // Unique identifier for this media item
  url String // URL or path to the media file
  uploadTimestamp DateTime // When the media item was uploaded
  type String // "photo" or "video"

**actions**

createAlbum (user: User, concert: ConcertEvent): (album: MediaAlbum)

  **requires** no album exists for (user, concert) // (The existence of the concert is assumed to be checked by a sync that calls this action)
  **effect** creates a new MediaAlbum linked to the concert and owned by the user, with an empty set of mediaItems and current time as createdAt.

uploadMedia (user: User, album: MediaAlbum, url: String, uploadTimestamp: DateTime, type: String): Empty | (error: String)

  **requires** album exists and album.owner = user
  **effect** adds a new MediaFileEntry (with a fresh ID, the provided URL, uploadTimestamp, and type) to the specified album's `mediaItems` set.

***
