---
timestamp: 'Fri Oct 17 2025 09:05:21 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_090521.fcba7e5b.md]]'
content_id: 1f42a469687af6aa80fe041f3bd0dd25122059198bfc8917d34588d77229315d
---

# problem:

The error `Type 'Db | MongoClient' is not assignable to type 'Db'` happens because when you destructure the array returned by `getDb()`, TypeScript infers that the array could be `(Db | MongoClient)[]`. This means it thinks *any* element in the array could be *either* a `Db` object or a `MongoClient` object. Therefore, it won't let you assign that uncertain union type to a variable that is strictly typed as `Db`.

Even though we know `getDb` always returns `[Db, MongoClient]` (a tuple with a fixed order), TypeScript's inference on the destructuring assignment is getting confused.
