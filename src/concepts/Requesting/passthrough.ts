/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // UserAccount - public authentication endpoints
  "/api/UserAccount/register": "public registration endpoint",
  "/api/UserAccount/login": "public login endpoint",
  "/api/UserAccount/updateName":
    "user updates own name, authenticated via userId in request",
  "/api/UserAccount/updatePassword":
    "user updates own password, authenticated via userId in request",

  // ConcertEvent - user-scoped actions authenticated via userId in request body
  "/api/ConcertEvent/addConcert":
    "user creates own concert, authenticated via userId in request",
  "/api/ConcertEvent/editConcertDetails":
    "user edits own concert, authenticated via userId ownership check",
  "/api/ConcertEvent/_getConcertsByUser":
    "user queries own concerts, authenticated via userId in request",
  "/api/ConcertEvent/deleteConcert":
    "user deletes own concert, authenticated via userId ownership check",

  // MediaAlbum - user-scoped actions authenticated via userId in request body
  "/api/MediaAlbum/createAlbum":
    "user creates own album, authenticated via userId in request",
  "/api/MediaAlbum/uploadMedia":
    "user uploads to own album, authenticated via userId ownership check",
  "/api/MediaAlbum/_getMediaAlbum":
    "user queries own album, authenticated via userId in request",
  "/api/MediaAlbum/_getAlbumsByUserAndConcert":
    "user queries own albums, authenticated via userId in request",
  "/api/MediaAlbum/deleteMedia":
    "user deletes own media, authenticated via userId ownership check",

  // ConcertStatsAI - user-scoped actions authenticated via userId in request body
  "/api/ConcertStatsAI/initializeUser":
    "user initializes own stats, authenticated via userId in request",
  "/api/ConcertStatsAI/logConcert":
    "user logs own concert, authenticated via userId in request",
  "/api/ConcertStatsAI/removeConcertFromHistory":
    "user removes own concert from history, authenticated via userId in request",
  "/api/ConcertStatsAI/generateSummaryAI":
    "user generates own summary, authenticated via userId in request",
  "/api/ConcertStatsAI/_getStatsRecord":
    "user queries own stats, authenticated via userId in request",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // No exclusions needed - all actions are authenticated via userId in request body
];
