# MediaAlbum Concept Specification

**concept** MediaAlbum [User, ConcertEvent]

**purpose** organize and store media files (photos and videos) associated with specific concert events

**principle** after a user attends a concert, they can create an album for that concert and upload media files to preserve their memories

**state**
a set of MediaAlbums with
albumID ID
owner User
concert ConcertEvent
mediaItems Set of { id ID, url String, uploadTimestamp DateTime, type String }
createdAt DateTime

**actions**
createAlbum (user: User, concert: ConcertEvent): (album: MediaAlbum)
**requires** no album exists for (user, concert)
**effects** creates a new MediaAlbum linked to the concert and owned by the user, with an empty set of mediaItems and current time as createdAt

uploadMedia (user: User, album: MediaAlbum, url: String, uploadTimestamp: DateTime, type: String): Empty
**requires** album exists and album.owner = user
**effects** adds a new MediaFileEntry to the specified album's mediaItems set
