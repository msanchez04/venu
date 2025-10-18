---
timestamp: 'Fri Oct 17 2025 08:29:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_082953.8a2e69ee.md]]'
content_id: 8af19bf529c85ef7d92fced3f22e8ed745df0c1fe636237548541d62fa026c72
---

# concept: UserAccount

This is the specification for the `UserAccount` concept that we will be implementing.

* **concept**: UserAccount
* **purpose**: Represents a registered user and handles authentication for the application.
* **principle**: Every user must have a valid account to access or modify concerts, media, or AI-generated summaries.
* **state**:
  * a set of `Users` with
    * `userID ID`
    * `name String`
    * `email String`
    * `password String`
    * `createdAt DateTime`
* **actions**:
  * `register (name: String, email: String, password: String): (user: User)`
    * **requires**: no existing user with the same email
    * **effect**: creates and stores a new `UserAccount` with current time as `createdAt`
  * `login (email: String, password: String): (success: Boolean)`
    * **requires**: user with matching email exists
    * **effect**: returns `true` if password matches; `false` otherwise
