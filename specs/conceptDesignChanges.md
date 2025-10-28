### User Account
Simplified user logic to not implement the friending feature. Instead, it is used to log in as a user to upload media for various concert events. This concept now allows a user to register to Venu and log in using an email and a password. The login action returns both the user ID and userName for personalized UI display. Users can update their display name and change their password through a settings interface.

### Concert Event
This concept stayed almost the same, with major changes being the removal of the friending actions. Instead, this concept just focuses on allowing a user to create a concert event and edit the details (artist, date, venue, city). Users can delete entire concert events, which automatically removes associated media albums and updates AI stats history. Added `_getConcertsByUser` internal endpoint to retrieve all concerts for a user, enabling session persistence.

### Media Album
This concept no longer has any of the friending actions that it originally had, such as setting the privacy of an album or tagging a friend. It serves the purpose of creating a media album to hold the contents of a concert event and uploading media to the album. The upload system now accepts file uploads converted to data URLs rather than external URLs, with auto-detection of media type (photo/video). Users can delete individual media items from albums. File size validation (5MB limit) prevents MongoDB document size limit issues.

### Concert Stats (ConcertStatsAI)
A lot of the personalizable features, such as streaks, artist count, and number of concerts attended, have been removed. This is to focus on the integration of the Gemini API for generating recommendations and the MusicBrainz API for validation to ensure the artist recommendations are not hallucinations. This concept now provides the user with a summary of the concerts they have attended as well as artist recommendations to discover. Added `removeConcertFromHistory` to sync AI stats when concerts are deleted, and `_getStatsRecord` to retrieve the complete stats record. The summary generation intelligently handles ties in artist counts by only reporting a "most-seen artist" when there's a clear winner.

### Notification
Removed concept entirely-- feedback included concern for too many concept ideas, so I chose to remove this entirely to focus on the workings of the other concepts. 