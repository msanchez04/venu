Focused on testing the output of the AI Summary and artist recommendations (Each step a different test case)
Tested: 
- using concert history to test ai summary was correct
- verified artists were not hallucinations
- no prior concerts logged error
## Complete Console Output

```
Task test deno test --allow-net --allow-env --allow-read --allow-sys "./tests/concertStatsAI.test.ts"
Check file:///Users/milena/Desktop/6.1040/venu/venu/tests/concertStatsAI.test.ts
running 1 test from ./tests/concertStatsAI.test.ts
ConcertStatsAIConcept Suite ...
  Setup: Initialize database connection ... ok (693ms)
  Operational Principle: initialize, log concerts, generate AI summary and recommendations ... ok (206ms)
  Variant: prevent duplicate initialization ... ok (52ms)
  Variant: generate summary fails when no history ... ok (136ms)
  Variant: logConcert requires prior initialize ... ok (17ms)
  Success: metal-only history yields metal recommendations and correct summary ... ok (133ms)
  Success: repeated artist sets favorite and multiple tags produce 2-3 recs ... ok (203ms)
  Success: pop history yields pop recommendations ... ok (226ms)
  Success: latin history yields latin recommendations ... ok (125ms)
  Cleanup: Close database connection ... ok (2ms)
ConcertStatsAIConcept Suite ... ok (1s)

ok | 1 passed (10 steps) | 0 failed (1s)
```
