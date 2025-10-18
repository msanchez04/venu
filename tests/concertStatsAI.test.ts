import { assertEquals, assertExists, assertMatch } from "@std/assert";
import { Db, MongoClient } from "mongodb";
import { ID } from "@utils/types.ts";
import { testDb } from "@utils/database.ts";
import ConcertStatsAIConcept from "@concepts/concertStatsAI.ts";

type StatsDocLite = {
  summary?: string;
  recommendations?: string[];
  concertHistory: Array<{ artist: string; venue: string; date: string | Date }>;
};

function makeMusicBrainzFetchStub() {
  // Canned minimal responses for endpoints we call
  return async (
    input: RequestInfo | URL,
    _init?: RequestInit
  ): Promise<Response> => {
    const href =
      typeof input === "string"
        ? input
        : input instanceof Request
        ? input.url
        : (input as URL).toString();
    const url = new URL(href);
    const pathname = url.pathname;
    await Promise.resolve();

    // Search artist by name: /ws/2/artist?query=...
    if (pathname === "/ws/2/artist" && url.searchParams.has("query")) {
      const query = (url.searchParams.get("query") ?? "").toLowerCase();
      // Very small router: map a few artist names to made-up MBIDs
      if (query.includes("radiohead")) {
        return new Response(
          JSON.stringify({
            artists: [{ id: "mbid-radiohead", name: "Radiohead" }],
          }),
          { status: 200 }
        );
      }
      if (query.includes("nirvana")) {
        return new Response(
          JSON.stringify({
            artists: [{ id: "mbid-nirvana", name: "Nirvana" }],
          }),
          { status: 200 }
        );
      }
      if (query.includes("metallica")) {
        return new Response(
          JSON.stringify({
            artists: [{ id: "mbid-metallica", name: "Metallica" }],
          }),
          { status: 200 }
        );
      }
      if (query.includes("taylor") || query.includes("swift")) {
        return new Response(
          JSON.stringify({
            artists: [{ id: "mbid-taylor", name: "Taylor Swift" }],
          }),
          { status: 200 }
        );
      }
      if (query.includes("shakira")) {
        return new Response(
          JSON.stringify({
            artists: [{ id: "mbid-shakira", name: "Shakira" }],
          }),
          { status: 200 }
        );
      }
      // Unknown: return empty
      return new Response(JSON.stringify({ artists: [] }), { status: 200 });
    }

    // Get artist with tags: /ws/2/artist/:id?inc=tags
    if (
      pathname.startsWith("/ws/2/artist/") &&
      url.searchParams.get("inc") === "tags"
    ) {
      if (pathname.endsWith("mbid-radiohead")) {
        return new Response(
          JSON.stringify({
            tags: [
              { name: "alternative", count: 50 },
              { name: "art rock", count: 10 },
            ],
          }),
          { status: 200 }
        );
      }
      if (pathname.endsWith("mbid-nirvana")) {
        return new Response(
          JSON.stringify({
            tags: [
              { name: "grunge", count: 60 },
              { name: "alternative", count: 20 },
            ],
          }),
          { status: 200 }
        );
      }
      if (pathname.endsWith("mbid-metallica")) {
        return new Response(
          JSON.stringify({
            tags: [
              { name: "metal", count: 70 },
              { name: "heavy metal", count: 30 },
            ],
          }),
          { status: 200 }
        );
      }
      if (pathname.endsWith("mbid-taylor")) {
        return new Response(
          JSON.stringify({
            tags: [
              { name: "pop", count: 80 },
              { name: "dance pop", count: 25 },
            ],
          }),
          { status: 200 }
        );
      }
      if (pathname.endsWith("mbid-shakira")) {
        return new Response(
          JSON.stringify({
            tags: [
              { name: "latin", count: 75 },
              { name: "pop", count: 20 },
            ],
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({ tags: [] }), { status: 200 });
    }

    // Search artists by tag: /ws/2/artist?tag=... (we return short lists)
    if (pathname === "/ws/2/artist" && url.searchParams.has("tag")) {
      const tag = url.searchParams.get("tag");
      if (tag === "alternative") {
        return new Response(
          JSON.stringify({
            artists: [
              { name: "The Smashing Pumpkins" },
              { name: "Pixies" },
              { name: "Blur" },
            ],
          }),
          { status: 200 }
        );
      }
      if (tag === "grunge") {
        return new Response(
          JSON.stringify({
            artists: [{ name: "Pearl Jam" }, { name: "Soundgarden" }],
          }),
          { status: 200 }
        );
      }
      if (tag === "metal" || tag === "heavy metal") {
        return new Response(
          JSON.stringify({
            artists: [
              { name: "Iron Maiden" },
              { name: "Megadeth" },
              { name: "Judas Priest" },
            ],
          }),
          { status: 200 }
        );
      }
      if (tag === "pop" || tag === "dance pop") {
        return new Response(
          JSON.stringify({
            artists: [
              { name: "Ariana Grande" },
              { name: "Dua Lipa" },
              { name: "Katy Perry" },
            ],
          }),
          { status: 200 }
        );
      }
      if (tag === "latin") {
        return new Response(
          JSON.stringify({
            artists: [
              { name: "Bad Bunny" },
              { name: "J Balvin" },
              { name: "Maluma" },
            ],
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({ artists: [] }), { status: 200 });
    }

    return new Response(undefined, { status: 404 });
  };
}

Deno.test("ConcertStatsAIConcept Suite", async (t) => {
  let db: Db;
  let client: MongoClient;
  let statsAI: ConcertStatsAIConcept;

  await t.step("Setup: Initialize database connection", async () => {
    [db, client] = await testDb();
    statsAI = new ConcertStatsAIConcept(db, {
      fetchFn: makeMusicBrainzFetchStub() as unknown as typeof fetch,
      musicBrainz: {
        userAgent: "Venu/1.0 (ConcertStatsAI-Test)",
        contact: "test@example.com",
      },
    });
    await db.collection("ConcertStatsAI.stats").deleteMany({});
  });

  await t.step(
    "Operational Principle: initialize, log concerts, generate AI summary and recommendations",
    async () => {
      const user = "user:alice" as ID;

      // initializeUser
      const initRes = await statsAI.initializeUser({ user });
      assertEquals(initRes, {});

      // logConcert - two shows
      const c1 = await statsAI.logConcert({
        user,
        artist: "Radiohead",
        venue: "MSG",
        date: new Date("2024-06-15T20:00:00Z"),
      });
      assertEquals(c1, {});

      const c2 = await statsAI.logConcert({
        user,
        artist: "Nirvana",
        venue: "The Roxy",
        date: new Date("2024-07-01T21:00:00Z"),
      });
      assertEquals(c2, {});

      // generateSummaryAI
      const gen = await statsAI.generateSummaryAI({ user });
      assertEquals(gen, {});

      // Verify state
      const doc = (await db
        .collection("ConcertStatsAI.stats")
        .findOne({ _id: user })) as StatsDocLite | null;
      assertExists(doc);
      assertExists(doc!.summary);
      assertMatch(doc!.summary!, /You have attended 2 concerts/);
      assertExists(doc!.recommendations);
      // Should be 1-3 recs depending on tag matches, and must not include known artists
      const recs = doc!.recommendations ?? [];
      assertEquals(
        recs.some((n) => n.toLowerCase() === "radiohead"),
        false
      );
      assertEquals(
        recs.some((n) => n.toLowerCase() === "nirvana"),
        false
      );
      assertEquals(recs.length > 0, true);
      assertEquals(recs.length <= 3, true);
    }
  );

  await t.step("Variant: prevent duplicate initialization", async () => {
    const user = "user:duplicate" as ID;
    const first = await statsAI.initializeUser({ user });
    assertEquals(first, {});
    const second = await statsAI.initializeUser({ user });
    assertEquals(second, { error: "Stats record already exists for user." });
  });

  await t.step("Variant: generate summary fails when no history", async () => {
    const user = "user:nohistory" as ID;
    await statsAI.initializeUser({ user });
    const gen = await statsAI.generateSummaryAI({ user });
    assertEquals(gen, { error: "User has no concert history." });
  });

  await t.step("Variant: logConcert requires prior initialize", async () => {
    const user = "user:unknown" as ID;
    const res = await statsAI.logConcert({
      user,
      artist: "Metallica",
      venue: "O2",
      date: new Date("2024-10-10T20:00:00Z"),
    });
    assertEquals(res, { error: "Stats record not found for user." });
  });

  await t.step(
    "Success: metal-only history yields metal recommendations and correct summary",
    async () => {
      const user = "user:metal" as ID;
      await statsAI.initializeUser({ user });
      await statsAI.logConcert({
        user,
        artist: "Metallica",
        venue: "Wembley",
        date: new Date("2024-03-01T20:00:00Z"),
      });
      const gen = await statsAI.generateSummaryAI({ user });
      assertEquals(gen, {});

      const doc = (await db
        .collection("ConcertStatsAI.stats")
        .findOne({ _id: user })) as StatsDocLite | null;
      assertExists(doc);
      assertMatch(doc!.summary ?? "", /You have attended 1 concerts/);
      const recs = doc!.recommendations ?? [];
      // Expect at least one classic metal band suggested
      const hasMetalRec = ["Iron Maiden", "Megadeth", "Judas Priest"].some(
        (name) => recs.includes(name)
      );
      assertEquals(hasMetalRec, true);
      // Should not recommend the same artist
      assertEquals(
        recs.some((n) => n.toLowerCase() === "metallica"),
        false
      );
    }
  );

  await t.step(
    "Success: repeated artist sets favorite and multiple tags produce 2-3 recs",
    async () => {
      const user = "user:mixed" as ID;
      await statsAI.initializeUser({ user });
      // Radiohead twice, Nirvana once
      await statsAI.logConcert({
        user,
        artist: "Radiohead",
        venue: "MSG",
        date: new Date("2024-01-10T20:00:00Z"),
      });
      await statsAI.logConcert({
        user,
        artist: "Radiohead",
        venue: "MSG",
        date: new Date("2024-02-10T20:00:00Z"),
      });
      await statsAI.logConcert({
        user,
        artist: "Nirvana",
        venue: "Some Club",
        date: new Date("2024-03-10T20:00:00Z"),
      });

      const gen = await statsAI.generateSummaryAI({ user });
      assertEquals(gen, {});

      const doc = (await db
        .collection("ConcertStatsAI.stats")
        .findOne({ _id: user })) as StatsDocLite | null;
      assertExists(doc);
      // Should reflect 3 total and favorite Radiohead
      assertMatch(doc!.summary ?? "", /You have attended 3 concerts/);
      assertMatch(doc!.summary ?? "", /most-seen artist.*Radiohead/);
      const recs = doc!.recommendations ?? [];
      assertEquals(recs.length > 0, true);
      assertEquals(recs.length <= 3, true);
      // Should avoid already seen artists
      const lower = recs.map((r) => r.toLowerCase());
      assertEquals(lower.includes("radiohead"), false);
      assertEquals(lower.includes("nirvana"), false);
    }
  );

  await t.step("Success: pop history yields pop recommendations", async () => {
    const user = "user:pop" as ID;
    await statsAI.initializeUser({ user });
    await statsAI.logConcert({
      user,
      artist: "Taylor Swift",
      venue: "Stadium",
      date: new Date("2024-04-01T20:00:00Z"),
    });
    const gen = await statsAI.generateSummaryAI({ user });
    assertEquals(gen, {});

    const doc = (await db
      .collection("ConcertStatsAI.stats")
      .findOne({ _id: user })) as StatsDocLite | null;
    assertExists(doc);
    const recs = doc!.recommendations ?? [];
    // Expect a pop artist in recommendations
    const hasPop = ["Ariana Grande", "Dua Lipa", "Katy Perry"].some((n) =>
      recs.includes(n)
    );
    assertEquals(hasPop, true);
    assertEquals(
      recs.some((n) => n.toLowerCase() === "taylor swift"),
      false
    );
  });

  await t.step(
    "Success: latin history yields latin recommendations",
    async () => {
      const user = "user:latin" as ID;
      await statsAI.initializeUser({ user });
      await statsAI.logConcert({
        user,
        artist: "Shakira",
        venue: "Arena",
        date: new Date("2024-05-01T20:00:00Z"),
      });
      const gen = await statsAI.generateSummaryAI({ user });
      assertEquals(gen, {});

      const doc = (await db
        .collection("ConcertStatsAI.stats")
        .findOne({ _id: user })) as StatsDocLite | null;
      assertExists(doc);
      const recs = doc!.recommendations ?? [];
      const hasLatin = ["Bad Bunny", "J Balvin", "Maluma"].some((n) =>
        recs.includes(n)
      );
      assertEquals(hasLatin, true);
      assertEquals(
        recs.some((n) => n.toLowerCase() === "shakira"),
        false
      );
    }
  );

  await t.step("Cleanup: Close database connection", async () => {
    await client.close();
  });
});
