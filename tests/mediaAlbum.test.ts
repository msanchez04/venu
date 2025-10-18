import { assertEquals, assertExists } from "@std/assert";
import { Db, MongoClient } from "mongodb";
import { ID } from "@utils/types.ts";
import { testDb } from "@utils/database.ts";
import MediaAlbumConcept from "@concepts/mediaAlbum.ts";

type MediaAlbumDocLite = {
  owner: ID;
  concert: ID;
  mediaItems: Array<{ type: "photo" | "video" }>;
};
type AlbumResult = { album: MediaAlbumDocLite };

Deno.test("MediaAlbumConcept Suite", async (t) => {
  // Shared handles
  let db: Db;
  let client: MongoClient;
  let mediaAlbum: MediaAlbumConcept;

  // Setup database and concept per suite
  await t.step("Setup: Initialize database connection", async () => {
    [db, client] = await testDb();
    mediaAlbum = new MediaAlbumConcept(db);
    // Always start with a clean collection for isolation
    await db.collection("MediaAlbum.mediaAlbums").deleteMany({});
  });

  await t.step(
    "Operational Principle: create an album, upload media, and fetch it",
    async () => {
      const user = "user:alice" as ID;
      const concert = "concert:radiohead-2024" as ID;

      // Create album
      const createRes = await mediaAlbum.createAlbum({ user, concert });
      assertExists(
        (createRes as { album: ID }).album,
        "Album ID should be returned"
      );
      const albumId = (createRes as { album: ID }).album;

      // Upload media into the album
      const uploadRes = await mediaAlbum.uploadMedia({
        user,
        album: albumId,
        url: "https://cdn.example.com/p/photo1.jpg",
        uploadTimestamp: new Date("2024-06-15T20:05:00Z"),
        type: "photo",
      });
      assertEquals(uploadRes, {});

      // Fetch and verify contents
      const albumFetch = await mediaAlbum._getMediaAlbum({ album: albumId });
      assertExists((albumFetch as AlbumResult).album);
      const albumDoc = (albumFetch as AlbumResult).album;
      assertEquals(albumDoc.owner, user);
      assertEquals(albumDoc.concert, concert);
      assertEquals(albumDoc.mediaItems.length, 1);
      assertEquals(albumDoc.mediaItems[0].type, "photo");
    }
  );

  await t.step(
    "Variant: prevent duplicate album for same (user, concert)",
    async () => {
      const user = "user:bob" as ID;
      const concert = "concert:beatles-1969" as ID;

      const first = await mediaAlbum.createAlbum({ user, concert });
      assertExists((first as { album: ID }).album);

      const dup = await mediaAlbum.createAlbum({ user, concert });
      assertEquals(dup, {
        error: "Album for this user and concert already exists.",
      });
    }
  );

  await t.step("Variant: only owner can upload media to album", async () => {
    const owner = "user:carol" as ID;
    const stranger = "user:not-owner" as ID;
    const concert = "concert:nirvana-1993" as ID;

    const createRes = await mediaAlbum.createAlbum({ user: owner, concert });
    const albumId = (createRes as { album: ID }).album;

    const res = await mediaAlbum.uploadMedia({
      user: stranger,
      album: albumId,
      url: "https://cdn.example.com/v/clip.mp4",
      uploadTimestamp: new Date("2024-01-01T00:00:00Z"),
      type: "video",
    });
    assertEquals(res, { error: "User is not the owner of this album." });
  });

  await t.step("Queries: list albums by user and concert", async () => {
    const user = "user:diana" as ID;
    const concert = "concert:metallica-2025" as ID;

    // Ensure clean slate for this user+concert subset
    await db
      .collection("MediaAlbum.mediaAlbums")
      .deleteMany({ owner: user, concert });

    // Create two albums for the same pair should be prevented; verify list size is 1
    const r1 = await mediaAlbum.createAlbum({ user, concert });
    assertExists((r1 as { album: ID }).album);

    const r2 = await mediaAlbum.createAlbum({ user, concert });
    assertEquals(r2, {
      error: "Album for this user and concert already exists.",
    });

    const list = await mediaAlbum._getAlbumsByUserAndConcert({ user, concert });
    assertEquals(list.albums.length, 1);
    assertEquals(list.albums[0].owner, user);
    assertEquals(list.albums[0].concert, concert);
  });

  // Cleanup
  await t.step("Cleanup: Close database connection", async () => {
    await client.close();
  });
});
