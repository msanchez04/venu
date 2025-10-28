## Design Changes

The overall design of the app has changed since assignment 2. There was concern for too many concepts, which turned out to be more than feasible. Instead, I focused the new design on just incorporating basic functionality such as user authentication, concert event creation, and the corresponding media album for image/video upload, and finally, the LLM feature, AI summary with artist recommendations based on a user's past concert history. I chose to narrow down my ideas for my app since I would need to take additional time to incorporate the MusicBrainz API to ensure the artist recommendations being produced are real and not hallucinations.

## UI/UX Enhancements

### 1) Color Scheme
Purple color palette:
- Primary dark: `#424874`
- Primary accent: `#a6b1e1`
- Light accent: `#dcd6f7`
- Very light background: `#f4eeff`

### 2) Session Persistence
Implemented localStorage-based session management to maintain user login state across page refreshes. This eliminates the frustration of being logged out when refreshing the page, following the assignment's suggestion for state storage.

### 3) File Upload System
Replaced URL-based media uploads with a native file upload system that:
- Supports direct file selection from the user's device
- Auto-detects media type (photo/video) from file MIME types
- Validates file sizes to prevent MongoDB document size limit issues
- Converts files to data URLs for storage

### 4) Media Gallery View
Enhanced media album display with:
- Album cover view showing up to 4 thumbnails per concert
- Full-screen gallery modal for viewing all media items
- Navigation between images/videos within the gallery
- Inline delete functionality from the gallery view

### 5) Concert Management
- Added delete functionality for entire concert events
- Integrated concert deletion with AI stats history removal
- Improved concert display with inline album preview

### 6) Account Settings
Implemented a settings modal with:
- Display name update capability
- Password change functionality
- Clean, accessible UI integrated into the dashboard header

### 7) Typography
Updated global font family to Helvetica for a clean, professional appearance.

## Interesting Moments

### 1) TypeScript Error Handling Discovery

**Moment**: Discovering the `'e' is of type 'unknown'` error when implementing error handling in the UserAccount concept.
**Impact**: This revealed the importance of proper TypeScript error handling and led to learning about `MongoServerError` type checking.
**Link**: [@userAccountImpl.md - TypeScript Error Handling](../design/brainstorming/userAccountImpl.md#question-i-am-getting-an-e-is-of-type-unknown-error-how-do-i-fix-this)

### 2) MusicBrainz API Integration Decision

**Moment**: Realizing the need to prevent AI hallucinations in artist recommendations by integrating with the MusicBrainz API.
**Impact**: This led to a significant design decision to use real music data instead of relying solely on LLM-generated recommendations.
**Link**: [@concertStatsAIImpl.md - MusicBrainz Integration](../design/brainstorming/concertStatsAIImpl.md#question-how-can-i-now-implement-this-concertevent-concept-based-on-the-venu-concept-deign-after-the-completion-of-the-mediaalbum-concept-i-also-want-to-use-this-api-from-the-web-httpsmusicbrainzorgdocmusicbrainz_api-to-provide-the-artist-suggestions-so-that-it-is-not-a-hallucination-how-can-i-incorporate-that)

### 3) Concept Design Simplification

**Moment**: Deciding to narrow down from too many concepts to focus on core functionality (UserAccount, ConcertEvent, MediaAlbum, ConcertStatsAI).
**Impact**: This simplification made the implementation more feasible and focused on essential features.
**Link**: [@appDesignChanges.md - Design Changes](../specs/appDesignChanges.md#design-changes)

### 4) Database Collection Naming Strategy

**Moment**: Implementing the PREFIX strategy to avoid naming conflicts between different concepts' MongoDB collections.
**Impact**: This established a clean pattern for organizing database collections across multiple concepts.
**Link**: [@concertEventImpl.md - Collection Prefix Strategy](../design/brainstorming/concertEventImpl.md#file-srcconcerteventconcerteventconceptts)

### 5) Security Consideration in Login

**Moment**: Implementing security best practices by returning the same response for "user not found" and "incorrect password" to prevent user enumeration attacks.
**Impact**: This demonstrated understanding of security principles in authentication systems.
**Link**: [@userAccountImpl.md - Security Implementation](../design/brainstorming/userAccountImpl.md#attempts-to-log-a-user-in-with-their-email-and-password)
