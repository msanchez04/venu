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
**effects** adds a new MediaFileEntry to the specified album's mediaItems set. The url parameter accepts data URLs from file uploads. The type is auto-detected from the file (photo or video).

deleteMedia (user: User, album: MediaAlbum, mediaId: ID): Empty
**requires** album exists, album.owner = user, and mediaId exists in album.mediaItems
**effects** removes the specified media item from the album's mediaItems set
