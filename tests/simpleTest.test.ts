import { assertEquals, assertExists, assertMatch } from "@std/assert";
import { Db, MongoClient } from "mongodb";
import { ID } from "@utils/types.ts";
import { testDb } from "@utils/database.ts";
import { default as UserAccountConcept } from "@concepts/userAccount.ts";
import ConcertEventConcept from "@concepts/concertEvent.ts";
import MediaAlbumConcept from "@concepts/mediaAlbum.ts";
import ConcertStatsAIConcept from "@concepts/concertStatsAI.ts";

// A tiny MusicBrainz stub for end-to-end to avoid real network
function makeMBStub() {
  return async (input: RequestInfo | URL): Promise<Response> => {
    const href =
      typeof input === "string"
        ? input
        : input instanceof Request
        ? input.url
        : (input as URL).toString();
    const url = new URL(href);
    const path = url.pathname;
    await Promise.resolve();
    if (path === "/ws/2/artist" && url.searchParams.has("query")) {
      const q = (url.searchParams.get("query") ?? "").toLowerCase();
      if (q.includes("radiohead")) {
        return new Response(
          JSON.stringify({ artists: [{ id: "rid", name: "Radiohead" }] }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({ artists: [] }), { status: 200 });
    }
    if (
      path.startsWith("/ws/2/artist/") &&
      url.searchParams.get("inc") === "tags"
    ) {
      return new Response(
        JSON.stringify({ tags: [{ name: "alternative", count: 10 }] }),
        { status: 200 }
      );
    }
    if (
      path === "/ws/2/artist" &&
      url.searchParams.get("tag") === "alternative"
    ) {
      return new Response(
        JSON.stringify({ artists: [{ name: "Pixies" }, { name: "Blur" }] }),
        { status: 200 }
      );
    }
    return new Response(undefined, { status: 404 });
  };
}

Deno.test(
  "End-to-End User Journey: register, add concert, upload media, AI summary",
  async (t) => {
    let db: Db;
    let client: MongoClient;
    let users: UserAccountConcept;
    let concerts: ConcertEventConcept;
    let albums: MediaAlbumConcept;
    let stats: ConcertStatsAIConcept;

    await t.step("Setup", async () => {
      [db, client] = await testDb();
      users = await UserAccountConcept.initialize(db);
      concerts = new ConcertEventConcept(db);
      albums = new MediaAlbumConcept(db);
      stats = new ConcertStatsAIConcept(db, {
        fetchFn: makeMBStub() as unknown as typeof fetch,
        musicBrainz: { userAgent: "Venu/1.0 (E2E)" },
      });
      await db.collection("UserAccount.users").deleteMany({});
      await db.collection("ConcertEvent.concerts").deleteMany({});
      await db.collection("MediaAlbum.mediaAlbums").deleteMany({});
      await db.collection("ConcertStatsAI.stats").deleteMany({});
    });

    await t.step("User registers and logs in", async () => {
      const reg = await users.register({
        name: "Alice",
        email: "alice@e2e.test",
        password: "pw",
      });
      assertExists((reg as { user: ID }).user, "Registration returns user ID");
      const user = (reg as { user: ID }).user;

      const login = await users.login({
        email: "alice@e2e.test",
        password: "pw",
      });
      assertEquals((login as { success: true; user: ID }).success, true);
      assertEquals((login as { success: true; user: ID }).user, user);

      // Initialize stats record as sync would do
      const initStats = await stats.initializeUser({ user });
      assertEquals(initStats, {});

      // Store user ID for next steps
      (t as unknown as { user: ID }).user = user;
    });

    await t.step("User logs a concert", async () => {
      const user = (t as unknown as { user: ID }).user;
      const add = await concerts.addConcert({
        user,
        artist: "artist:radiohead" as ID,
        date: new Date("2024-06-15T20:00:00Z"),
        venue: "MSG",
        city: "New York",
      });
      assertExists((add as { concert: { _id: ID } }).concert);
      const concert = (add as { concert: { _id: ID } }).concert;

      // Optionally, an app sync could create the media album automatically; do it here explicitly
      const createdAlbum = await albums.createAlbum({
        user,
        concert: concert._id,
      });
      assertExists((createdAlbum as { album: ID }).album);
      const albumId = (createdAlbum as { album: ID }).album;

      // Log into stats
      const log = await stats.logConcert({
        user,
        artist: "Radiohead",
        venue: "MSG",
        date: new Date("2024-06-15T20:00:00Z"),
      });
      assertEquals(log, {});

      // Store album and concert for next step
      (t as unknown as { album: ID }).album = albumId;
    });

    await t.step("User uploads media to the album", async () => {
      const user = (t as unknown as { user: ID }).user;
      const album = (t as unknown as { album: ID }).album;
      const upload = await albums.uploadMedia({
        user,
        album,
        url: "https://cdn.example.com/p/photo1.jpg",
        uploadTimestamp: new Date("2024-06-15T20:05:00Z"),
        type: "photo",
      });
      assertEquals(upload, {});
    });

    await t.step(
      "User requests an AI summary and recommendations",
      async () => {
        const user = (t as unknown as { user: ID }).user;
        const gen = await stats.generateSummaryAI({ user });
        assertEquals(gen, {});
        const doc = await db
          .collection("ConcertStatsAI.stats")
          .findOne({ _id: user });
        assertExists(doc);
        assertMatch(
          (doc as { summary?: string }).summary ?? "",
          /You have attended 1 concerts/
        );
        const recs =
          (doc as { recommendations?: string[] }).recommendations ?? [];
        assertEquals(recs.length > 0, true);
      }
    );

    await t.step("Cleanup", async () => {
      await client.close();
    });
  }
);
