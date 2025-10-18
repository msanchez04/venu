---
timestamp: 'Fri Oct 17 2025 09:47:11 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_094711.bfb6b9f0.md]]'
content_id: 99a3ceee49949020cab668c30f2e3e9a21e6ec0f1433ad8b0b37f48ea9f598b9
---

# concept: ConcertEvent

* **concept**: ConcertEvent \[User, Artist]
* **purpose**: Represents a single concert that a user attended, serving as the hub for related data (media, summaries, stats).
* **principle**: Each concert is a distinct event linked to one or more artists and one user; all media and summaries are tied to this event.
* **state**:
  * a set of ConcertEvents with
    * concertID ID
    * owner User
    * artist Artist
    * date DateTime
    * venue String
    * city String
    * rating Number (optional)
* **actions**:
  * `addConcert (user: User, artist: Artist, date: DateTime, venue: String, city: String): (concert: ConcertEvent)`
    * **requires**: no ConcertEvent exists for (user, artist, date, venue)
    * **effect**: creates and saves a new ConcertEvent linked to the user
  * `editConcertDetails (concert: ConcertEvent, newArtist?: Artist, newDate?: DateTime, newVenue?: String, newCity?: String)`
    * **requires**: concert exists
    * **effect**: updates any specified concert details

***
