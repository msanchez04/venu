---
timestamp: 'Mon Oct 20 2025 23:45:56 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_234556.67f94857.md]]'
content_id: 83e87a2b8b2850b6c23b20347c497fee33981b8d51baf418416b0afc7f506329
---

# API Specification: ConcertEvent Concept

**Purpose:** represent a single concert that a user attended, serving as the hub for related data

***

## API Endpoints

### POST /api/ConcertEvent/addConcert

**Description:** Creates and saves a new ConcertEvent linked to a user with specific artist, date, venue, and city details.

**Requirements:**

* no ConcertEvent exists for (user, artist, date, venue)

**Effects:**

* creates and saves a new ConcertEvent linked to the user

**Request Body:**

```json
{
  "user": "string",
  "artist": "string",
  "date": "string",
  "venue": "string",
  "city": "string"
}
```

**Success Response Body (Action):**

```json
{
  "concert": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/ConcertEvent/editConcertDetails

**Description:** Updates any specified details for an existing concert event.

**Requirements:**

* concert exists

**Effects:**

* updates any specified concert details

**Request Body:**

```json
{
  "concert": "string",
  "newArtist": "string | null",
  "newDate": "string | null",
  "newVenue": "string | null",
  "newCity": "string | null"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
