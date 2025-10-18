import { Collection, Db } from "mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

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
    name: string
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
    }
  ) {
    this.stats = this.db.collection<StatsDoc>(PREFIX + "stats");
    const userAgent =
      options?.musicBrainz?.userAgent ?? "Venu/1.0 (ConcertStatsAI)";
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
        { $push: { concertHistory: entry }, $set: { updatedAt: new Date() } }
      );
      return {};
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Failed to log concert: ${message}`);
      return { error: "Failed to log concert due to a database error." };
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
    if (record.concertHistory.length === 0) {
      return { error: "User has no concert history." };
    }

    // Build a simple summary from history
    const totalConcerts = record.concertHistory.length;
    const byArtist = new Map<string, number>();
    for (const h of record.concertHistory) {
      byArtist.set(h.artist, (byArtist.get(h.artist) ?? 0) + 1);
    }
    const favoriteArtist = Array.from(byArtist.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];
    const summary = favoriteArtist
      ? `You have attended ${totalConcerts} concerts. Your most-seen artist so far is ${favoriteArtist}.`
      : `You have attended ${totalConcerts} concerts.`;

    // Generate recommendations via MusicBrainz based on top tags across user's artists
    const knownArtists = new Set<string>(
      Array.from(byArtist.keys()).map((n) => n.toLowerCase())
    );
    const tagCounts = new Map<string, number>();

    // For each unique artist, attempt to resolve tags via MB
    for (const artistName of byArtist.keys()) {
      try {
        const found = await this.mbClient.searchArtistByName(artistName);
        if (!found) continue;
        const tags = await this.mbClient.getArtistTags(found.id);
        for (const tag of tags) {
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.warn(
          `MusicBrainz tag lookup failed for '${artistName}': ${message}`
        );
      }
    }

    // Choose top tags
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    // Search recommendations for each tag
    const recommendedNames: string[] = [];
    for (const tag of topTags) {
      try {
        const names = await this.mbClient.searchArtistsByTag(tag, 15);
        for (const name of names) {
          const key = name.toLowerCase();
          if (
            !knownArtists.has(key) &&
            !recommendedNames.some((n) => n.toLowerCase() === key)
          ) {
            recommendedNames.push(name);
            if (recommendedNames.length >= 3) break;
          }
        }
        if (recommendedNames.length >= 3) break;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.warn(
          `MusicBrainz recommendation search failed for tag '${tag}': ${message}`
        );
      }
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
        }
      );
      return {};
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Failed to update stats summary: ${message}`);
      return { error: "Failed to generate summary due to a database error." };
    }
  }
}
