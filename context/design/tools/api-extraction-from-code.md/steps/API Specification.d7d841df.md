---
timestamp: 'Mon Oct 20 2025 23:42:30 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_234230.fe442177.md]]'
content_id: d7d841df94507f130a972f340b901e325a669b445661fee828bdc7402d36a815
---

# API Specification: ConcertEvent Concept

**Purpose:** represent a single concert that a user attended, serving as the hub for related data

***

## API Endpoints

### POST /api/ConcertEvent/addConcert

**Description:** Creates and saves a new concert event record for a user, linked to the specified artist, date, venue, and city.

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

**Description:** Updates existing details of a specified concert event.

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
