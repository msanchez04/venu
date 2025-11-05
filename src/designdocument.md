# Design Document

## Overarching Changes

### Challenges

1) **Complex Concepts**: After receiving feedback from assignment 2, there was a concern that my concepts were too complex. Once I began implementing my concepts, I too realized some actions would need to be narrowed down in order to have a presentable final project due to the time constraint. A lot of my original concept ideas from assignment 2 were simplified or cut out. For example, I removed the idea of friending and its related actions in my concept designs. I also simplified a lot of the actions related to the statistics the app provides the user in order to focus on the principal functionality of the app such as authentication and media upload.
**Reference**: [@appDesignChanges.md - Design Changes](../specs/appDesignChanges.md#design-changes)


2) **Number of Concepts**: In addition to the complexity of my original concepts from assignment 2, there was a concern that there were too many concepts and actions for each concept. I also decided to remove and limit a lot of the actions for my main concepts. I narrowed down the count of concepts from 5 to 4 and also limited the actions heavily. I completely eliminated the Notification concept I had originally planned and also simplified some functionality (more of a personal journal rather than collaborative with other friends).


3) **Limited LLM Usage**: In my original design, I had overestimated the LLM capabilities we would be allotted and a lot of my AI functionaility involved the media users upload rather than text. For example, I wanted to included an AI reel/highlight generator that would create a short clip using randomly selected media that had been uploaded. This was not feasible using Gemini API, so I had to brainstorm a new AI component to my project. Instead, I chose to use the text input from the user such as the concert details (artist, location, venue) to generate artist suggestions. Ideally, the reccomendations would be persoanlized based on past event history.


4) **Artist Reccomendation Verification**: Proceeding with the new AI integration idea, there was a new issue that was brought up in the feedback I recieved which was the possibility of hallucinations when it came to the reccomendations produced by the LLM. Due to this issue, it was suggested that I use another API (MusicBrainz) in order to verify the output of Gemini LLM. Because the staff and I hadn't worked with this API before, I needed to allot more time to figure out its usage which is why I chose to simplify other aspects of my app in order to ensure the output of the reccomendations could be verified. **Reference**: [@concertStatsAIImpl.md - MusicBrainz Integration](../design/brainstorming/concertStatsAIImpl.md#question-how-can-i-now-implement-this-concertevent-concept-based-on-the-venu-concept-deign-after-the-completion-of-the-mediaalbum-concept-i-also-want-to-use-this-api-from-the-web-httpsmusicbrainzorgdocmusicbrainz_api-to-provide-the-artist-suggestions-so-that-it-is-not-a-hallucination-how-can-i-incorporate-that)

## Concept Changes

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

## Visual Changes

**Color Palette**: Used a purple color palette for a more coherent and aesthetic app experience. 

**Simplified Pages**: Narrowed down to the login/registration page and included a dashboard to make concert events more navigable. This experience was more intuitive and easier to maintain.

**Additional Functionalities**: After UI testing, I noticed some important features were missing and chose to include them. This included the ability to change your name on the dashboard as well as changing your password. Although I originally considered the idea of editing a concert event, I realized I also needed to incorporate the ability to delete concert events entirely as well as media from media albums.