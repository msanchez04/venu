## Complete Console Output

```
Task test deno test --allow-net --allow-env --allow-read --allow-sys "./tests/mediaAlbum.test.ts"
running 1 test from ./tests/mediaAlbum.test.ts
MediaAlbumConcept Suite ...
  Setup: Initialize database connection ... ok (550ms)
  Operational Principle: create an album, upload media, and fetch it ... ok (132ms)
  Variant: prevent duplicate album for same (user, concert) ... ok (72ms)
  Variant: only owner can upload media to album ... ok (142ms)
  Queries: list albums by user and concert ... ok (95ms)
  Cleanup: Close database connection ... ok (3ms)
MediaAlbumConcept Suite ... ok (994ms)

ok | 1 passed (6 steps) | 0 failed (1s)
```
