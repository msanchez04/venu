import { Collection, Db } from "mongodb";
import { Empty, ID } from "../../utils/types.ts";
import { freshID } from "../../utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "ConcertStatsAI" + ".";

// Generic types used by this concept (external IDs)
type User = ID;

interface ConcertHistoryEntry {
  id: ID; // internal identifier for the entry
  artist: string;
  venue: string;
  date: Date;
}

/**
 * Represents a single ConcertStatsAI document in the database for a user.
 * a set of StatsRecords with
 *   user User (stored as _id)
 *   concertHistory Set of { artist String, venue String, date DateTime }
 *   summary String
 *   recommendations List of String
 */
interface StatsDoc {
  _id: User;
  concertHistory: ConcertHistoryEntry[];
  summary?: string;
  recommendations?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Minimal MusicBrainz client used only for generating recommendations.
 * Injects fetch and identifies via User-Agent as required by MB.
 */
class MusicBrainzClient {
  private readonly fetchFn: typeof fetch;
  private readonly userAgent: string;
  private readonly contact?: string;

  constructor({
    fetchFn,
    userAgent,
    contact,
  }: {
    fetchFn?: typeof fetch;
    userAgent: string;
    contact?: string;
  }) {
    this.fetchFn = fetchFn ?? fetch;
    this.userAgent = userAgent;
    this.contact = contact;
  }

  private buildHeaders(): Headers {
    const headers = new Headers();
    // MusicBrainz requires a descriptive User-Agent: https://musicbrainz.org/doc/MusicBrainz_API
    const ua = this.contact
      ? `${this.userAgent} (${this.contact})`
      : this.userAgent;
    headers.set("User-Agent", ua);
    return headers;
  }

  async searchArtistByName(
    name: string,
  ): Promise<{ id: string; name: string } | undefined> {
    const url = new URL("https://musicbrainz.org/ws/2/artist");
    url.searchParams.set("fmt", "json");
    url.searchParams.set("query", `artist:"${name}"`);
    const resp = await this.fetchFn(url.toString(), {
      headers: this.buildHeaders(),
    });
    if (!resp.ok) return undefined;
    const data = (await resp.json()) as {
      artists?: Array<{ id: string; name: string }>;
    };
    return data.artists && data.artists.length > 0
      ? data.artists[0]
      : undefined;
  }

  async getArtistTags(artistId: string): Promise<string[]> {
    const url = new URL(`https://musicbrainz.org/ws/2/artist/${artistId}`);
    url.searchParams.set("fmt", "json");
    url.searchParams.set("inc", "tags");
    const resp = await this.fetchFn(url.toString(), {
      headers: this.buildHeaders(),
    });
    if (!resp.ok) return [];
    const data = (await resp.json()) as {
      tags?: Array<{ name: string; count?: number }>;
    };
    const tags = data.tags ?? [];
    // Sort by count desc if available
    tags.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
    return tags.map((t) => t.name).slice(0, 5);
  }

  async searchArtistsByTag(tag: string, limit = 10): Promise<string[]> {
    const url = new URL("https://musicbrainz.org/ws/2/artist");
    url.searchParams.set("fmt", "json");
    url.searchParams.set("tag", tag);
    url.searchParams.set("limit", String(limit));
    const resp = await this.fetchFn(url.toString(), {
      headers: this.buildHeaders(),
    });
    if (!resp.ok) return [];
    const data = (await resp.json()) as { artists?: Array<{ name: string }> };
    return (data.artists ?? []).map((a) => a.name);
  }
}

export default class ConcertStatsAIConcept {
  private readonly stats: Collection<StatsDoc>;
  private readonly mbClient: MusicBrainzClient;

  constructor(
    private readonly db: Db,
    options?: {
      fetchFn?: typeof fetch;
      musicBrainz?: { userAgent: string; contact?: string };
    },
  ) {
    this.stats = this.db.collection<StatsDoc>(PREFIX + "stats");
    const userAgent = options?.musicBrainz?.userAgent ??
      "Venu/1.0 (ConcertStatsAI)";
    const contact = options?.musicBrainz?.contact;
    this.mbClient = new MusicBrainzClient({
      fetchFn: options?.fetchFn,
      userAgent,
      contact,
    });
  }

  /**
   * initializeUser (user: User)
   * requires: user exists (externally) and no StatsRecord exists for user
   * effect: creates an empty StatsRecord for user
   */
  async initializeUser({
    user,
  }: {
    user: User;
  }): Promise<Empty | { error: string }> {
    const existing = await this.stats.findOne({ _id: user });
    if (existing) {
      return { error: "Stats record already exists for user." };
    }
    const now = new Date();
    const doc: StatsDoc = {
      _id: user,
      concertHistory: [],
      summary: undefined,
      recommendations: undefined,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await this.stats.insertOne(doc);
      return {};
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Failed to initialize stats: ${message}`);
      return { error: "Failed to initialize stats due to a database error." };
    }
  }

  /**
   * logConcert (user: User, artist: String, venue: String, date: DateTime)
   * requires: user stats record exists
   * effect: appends concert to user’s concertHistory
   */
  async logConcert({
    user,
    artist,
    venue,
    date,
  }: {
    user: User;
    artist: string;
    venue: string;
    date: Date;
  }): Promise<Empty | { error: string }> {
    const existing = await this.stats.findOne({ _id: user });
    if (!existing) {
      return { error: "Stats record not found for user." };
    }
    const entry: ConcertHistoryEntry = {
      id: freshID(),
      artist,
      venue,
      date,
    };
    try {
      await this.stats.updateOne(
        { _id: user },
        { $push: { concertHistory: entry }, $set: { updatedAt: new Date() } },
      );
      return {};
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Failed to log concert: ${message}`);
      return { error: "Failed to log concert due to a database error." };
    }
  }

  /**
   * removeConcertFromHistory (user: User, artist: String, venue: String, date: DateTime)
   * requires: user stats record exists
   * effect: removes concert from user's concertHistory
   */
  async removeConcertFromHistory({
    user,
    artist,
    venue,
    date: _date,
  }: {
    user: User;
    artist: string;
    venue: string;
    date: Date;
  }): Promise<Empty | { error: string }> {
    const existing = await this.stats.findOne({ _id: user });
    if (!existing) {
      return { error: "Stats record not found for user." };
    }

    try {
      console.log(`Attempting to remove concert: ${artist} at ${venue}`);
      console.log(`Current history length: ${existing.concertHistory.length}`);

      // Remove the first matching concert from history by artist and venue
      // (Date matching can be problematic due to serialization issues)
      const updatedHistory = existing.concertHistory.filter(
        (entry) => entry.artist !== artist || entry.venue !== venue,
      );

      console.log(`Updated history length: ${updatedHistory.length}`);

      if (updatedHistory.length === existing.concertHistory.length) {
        console.warn(
          `No matching concert found to remove for ${artist} at ${venue}`,
        );
        // Still return success to avoid errors if the entry wasn't found
        return {};
      }

      await this.stats.updateOne(
        { _id: user },
        {
          $set: {
            concertHistory: updatedHistory,
            updatedAt: new Date(),
          },
        },
      );
      console.log(`Successfully removed concert from history`);
      return {};
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Failed to remove concert: ${message}`);
      return { error: "Failed to remove concert due to a database error." };
    }
  }

  /**
   * generateSummaryAI (user: User)
   * requires: user has at least one logged concert
   * effect: produces a human-readable summary and 2–3 artist recommendations using MusicBrainz
   */
  async generateSummaryAI({
    user,
  }: {
    user: User;
  }): Promise<Empty | { error: string }> {
    const record = await this.stats.findOne({ _id: user });
    if (!record) {
      return { error: "Stats record not found for user." };
    }
    console.log(
      `Generating summary for user ${user}. Concert history length: ${record.concertHistory.length}`,
    );
    console.log(
      `Concert history:`,
      record.concertHistory.map((h) => `${h.artist} at ${h.venue}`),
    );

    if (record.concertHistory.length === 0) {
      return { error: "User has no concert history." };
    }

    // Build a simple summary from history
    const totalConcerts = record.concertHistory.length;
    const byArtist = new Map<string, number>();
    for (const h of record.concertHistory) {
      byArtist.set(h.artist, (byArtist.get(h.artist) ?? 0) + 1);
    }
    const sortedArtists = Array.from(byArtist.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    const topCount = sortedArtists[0]?.[1] ?? 0;
    const secondCount = sortedArtists[1]?.[1] ?? 0;

    // Only mention "most-seen artist" if there's a clear winner (not a tie)
    const favoriteArtist = topCount > secondCount
      ? sortedArtists[0]?.[0]
      : undefined;
    const summary = favoriteArtist
      ? `You have attended ${totalConcerts} concert${
        totalConcerts !== 1 ? "s" : ""
      }. Your most-seen artist so far is ${favoriteArtist}.`
      : `You have attended ${totalConcerts} concert${
        totalConcerts !== 1 ? "s" : ""
      }.`;

    // Get known artists for filtering
    const knownArtists = new Set<string>(
      Array.from(byArtist.keys()).map((n) => n.toLowerCase()),
    );

    // Use Gemini AI to generate initial recommendations
    const recommendedNames: string[] = [];

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY not found in environment");
      return { error: "Gemini API key not configured" };
    }

    // Use 2.5-flash with high token limit to accommodate thoughts + text
    const geminiModel = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";

    const geminiPrompt = `Based on this concert history:
${
      Array.from(byArtist.entries())
        .map(([artist, count]) =>
          `- ${artist} (${count} ${count === 1 ? "concert" : "concerts"})`
        )
        .join("\n")
    }

Please recommend 5-7 real, popular music artists that someone with this concert history might enjoy. Return ONLY a comma-separated list of artist names, no other text.`;

    console.log("Calling Gemini API for recommendations...");
    let geminiText: string | undefined;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: geminiPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 3000,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error (${response.status}):`, errorText);
        return { error: "Failed to generate recommendations from Gemini API" };
      }

      const data = await response.json();
      console.log("Full Gemini response:", JSON.stringify(data, null, 2));

      // Try to extract text - it might be in different places depending on API version
      geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      // If no parts, try other possible locations
      if (!geminiText) {
        const candidate = data.candidates?.[0];
        if (candidate?.text) {
          geminiText = candidate.text;
        } else if (candidate?.content?.text) {
          geminiText = candidate.content.text;
        }
      }

      console.log("Extracted Gemini text:", geminiText);

      if (!geminiText) {
        console.error("No text in Gemini response. Response structure:", data);
        return {
          error:
            "No recommendations generated. Try increasing token limit or check API response.",
        };
      }
    } catch (e) {
      console.error("Gemini API call failed:", e);
      return { error: "Failed to call Gemini API" };
    }

    // Parse Gemini response
    const suggestedArtists = geminiText!
      .split(",")
      .map((a: string) => a.trim())
      .filter((a: string) => a.length > 0);

    console.log("Parsed suggested artists:", suggestedArtists);

    // Validate suggestions with MusicBrainz
    for (const artistName of suggestedArtists) {
      if (recommendedNames.length >= 3) break;

      try {
        const mbArtist = await this.mbClient.searchArtistByName(artistName);
        console.log(
          `Validating "${artistName}":`,
          mbArtist?.name || "not found",
        );

        if (mbArtist && !knownArtists.has(mbArtist.name.toLowerCase())) {
          recommendedNames.push(mbArtist.name);
          console.log(`Added recommendation: ${mbArtist.name}`);
        }
      } catch (e) {
        console.debug(`Could not validate artist: ${artistName}`, e);
      }
    }

    if (recommendedNames.length === 0) {
      console.error("No artists could be validated by MusicBrainz");
      return {
        error: "Could not validate any recommendations with MusicBrainz",
      };
    }

    try {
      await this.stats.updateOne(
        { _id: user },
        {
          $set: {
            summary,
            recommendations: recommendedNames.slice(0, 3),
            updatedAt: new Date(),
          },
        },
      );
      return {};
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Failed to update stats summary: ${message}`);
      return { error: "Failed to generate summary due to a database error." };
    }
  }

  /**
   * Query method to get a user's stats record
   * @param user The user ID
   * @returns The stats record or an error
   */
  async _getStatsRecord({
    user,
  }: {
    user: User;
  }): Promise<{ record: StatsDoc } | { error: string }> {
    const record = await this.stats.findOne({ _id: user });
    if (!record) {
      return { error: "Stats record not found for user." };
    }
    return { record };
  }
}
