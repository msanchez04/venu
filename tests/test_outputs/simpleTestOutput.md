Focused on testing essentially end-to-end using the 6-step breakdown
Tested:
- User registration
- User login
- User uploading to the media album
- AI Summary and artist recommendations using MusicBrainz API
## Complete Console Output

```
Task test deno test --allow-net --allow-env --allow-read --allow-sys "./tests/simpleTest.test.ts"
running 1 test from ./tests/simpleTest.test.ts
End-to-End User Journey: register, add concert, upload media, AI summary ...
  Setup ... ok (775ms)
  User registers and logs in ... ok (107ms)
  User logs a concert ... ok (143ms)
  User uploads media to the album ... ok (117ms)
  User requests an AI summary and recommendations ... ok (117ms)
  Cleanup ... ok (4ms)
End-to-End User Journey: register, add concert, upload media, AI summary ... ok (1s)

ok | 1 passed (6 steps) | 0 failed (1s)
```
