---
timestamp: 'Fri Oct 17 2025 08:34:38 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_083438.9a789059.md]]'
content_id: 121297d5454c1874271246bad9f1025b70b1f8dff11f1d654ed6b162564c0273
---

# problem:

In the `register` method, the `catch (e)` block attempts to access `e.code`. However, since TypeScript 4.4, the default type for a caught error is `unknown`. The `unknown` type is intentionally restrictive; you cannot access any properties on a value of type `unknown` without first performing a type check to narrow down its type. This prevents potential runtime errors if the caught object isn't what you expect.
