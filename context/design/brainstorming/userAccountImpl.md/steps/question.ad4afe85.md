---
timestamp: 'Fri Oct 17 2025 09:26:03 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_092603.4511be0a.md]]'
content_id: ad4afe857e30cf638bd8bcb1a66a8de13e3b1c2e9e154daa795e45243d23c1e6
---

# question: When I try to run deno task test ./tests/userAccount.test.ts I get this error: Task test deno test --allow-net --allow-env "./tests/userAccount.test.ts" Check file:///Users/milena/Desktop/6.1040/venu/venu/tests/userAccount.test.tsUncaught error from ./tests/userAccount.test.ts FAILED ERRORS ./tests/userAccount.test.ts (uncaught error) error: (in promise) NotCapable: Requires read access to ".env", run again with the --allow-read flag    return parse(Deno.readTextFileSync(filepath));  ^ at Object.readTextFileSync (ext:deno\_fs/30\_fs.js:771:10)at parseFileSync (https://jsr.io/@std/dotenv/0.225.2/mod.ts:233:23)at loadSync (https://jsr.io/@std/dotenv/0.225.2/mod.ts:69:26)at https://jsr.io/@std/dotenv/0.225.2/load.ts:11:3 This error was not caught from a test and caused the test runner to fail on the referenced module. It most likely originated from a dangling promise, event/timeout handler or top-level code.
