## Design Changes

The overall design of the app has changed since assignment 2. There was concern for too many concepts, which turned out to be more than feasible. Instead, I focused the new design on just incorporating basic functionality such as user authentication, concert event creation, and the corresponding media album for image/video upload, and finally, the LLM feature, AI summary with artist recommendations based on a user's past concert history. I chose to narrow down my ideas for my app since I would need to take additional time to incorporate the MusicBrainz API to ensure the artist recommendations being produced are real and not hallucinations.

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
