### User Account
Simplified user logic to not implement the friending feature. Instead, it is used to log in as a user to upload media for various concert events. This concept now allows a user to register to Venu and log in using an email and a password.

### Concert Event
This concept stayed almost the same, with major changes being the removal of the friending actions. Instead, this concept just focuses on allowing a user to create a concert event and edit the details (artist, date, location).

### Media Album
This concept no longer has any of the friending actions that it originally had, such as setting the privacy of an album or tagging a friend. It serves the purpose of creating a media album to hold the contents of a concert event and uploading the media to the album.

### Concert Stats
A lot of the personalizable features, such as streaks, artist count, and number of concerts attended, have been removed. This is to focus on the integration of the MusicBrainz API to ensure the artist recommendations this concept provides are not hallucinations. This concept now provides the user with a summary of the concerts they have attended as well as artist recommendations to discover.

### Notification
Removed concept entirely-- feedback included concern for too many concept ideas, so I chose to remove this entirely to focus on the workings of the other concepts. 