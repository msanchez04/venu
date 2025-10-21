# Venu Backend API Specification

## Base Information

- **Base URL**: `http://localhost:8000`
- **API Base Path**: `/api`
- **Content Type**: `application/json`
- **Method**: All endpoints use POST

## Server Endpoints

### Health Check

- **Endpoint**: `GET /`
- **Description**: Check if the server is running
- **Response**: `"Concept Server is running."`

## Concept Endpoints

### UserAccount Concept

Base path: `/api/userAccount`

#### Register User

- **Endpoint**: `POST /api/userAccount/register`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - Success: `{"user": "user_id"}`
  - Error: `{"error": "error_message"}`

#### Login User

- **Endpoint**: `POST /api/userAccount/login`
- **Description**: Authenticate a user
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - Success: `{"success": true, "user": "user_id"}`
  - Failure: `{"success": false}`
  - Error: `{"error": "error_message"}`

### ConcertEvent Concept

Base path: `/api/concertEvent`

#### Add Concert

- **Endpoint**: `POST /api/concertEvent/addConcert`
- **Description**: Create a new concert event
- **Request Body**:
  ```json
  {
    "user": "user_id",
    "artist": "artist_id",
    "date": "ISO_date_string",
    "venue": "string",
    "city": "string"
  }
  ```
- **Response**:
  - Success: `{"concert": {"_id": "concert_id", "owner": "user_id", "artist": "artist_id", "date": "ISO_date", "venue": "string", "city": "string"}}`
  - Error: `{"error": "error_message"}`

#### Edit Concert Details

- **Endpoint**: `POST /api/concertEvent/editConcertDetails`
- **Description**: Update concert information
- **Request Body**:
  ```json
  {
    "concert": "concert_id",
    "newArtist": "artist_id (optional)",
    "newDate": "ISO_date_string (optional)",
    "newVenue": "string (optional)",
    "newCity": "string (optional)"
  }
  ```
- **Response**:
  - Success: `{}`
  - Error: `{"error": "error_message"}`

### MediaAlbum Concept

Base path: `/api/mediaAlbum`

#### Create Album

- **Endpoint**: `POST /api/mediaAlbum/createAlbum`
- **Description**: Create a new media album for a concert
- **Request Body**:
  ```json
  {
    "user": "user_id",
    "concert": "concert_id"
  }
  ```
- **Response**:
  - Success: `{"album": "album_id"}`
  - Error: `{"error": "error_message"}`

#### Upload Media

- **Endpoint**: `POST /api/mediaAlbum/uploadMedia`
- **Description**: Add media files to an album
- **Request Body**:
  ```json
  {
    "user": "user_id",
    "album": "album_id",
    "url": "string",
    "uploadTimestamp": "ISO_date_string",
    "type": "photo" | "video"
  }
  ```
- **Response**:
  - Success: `{}`
  - Error: `{"error": "error_message"}`

#### Get Media Album (Query)

- **Endpoint**: `POST /api/mediaAlbum/_getMediaAlbum`
- **Description**: Retrieve a media album by ID
- **Request Body**:
  ```json
  {
    "album": "album_id"
  }
  ```
- **Response**:
  - Success: `{"album": {"_id": "album_id", "owner": "user_id", "concert": "concert_id", "mediaItems": [...], "createdAt": "ISO_date"}}`
  - Error: `{"error": "error_message"}`

#### Get Albums by User and Concert (Query)

- **Endpoint**: `POST /api/mediaAlbum/_getAlbumsByUserAndConcert`
- **Description**: Get all albums for a user and concert
- **Request Body**:
  ```json
  {
    "user": "user_id",
    "concert": "concert_id"
  }
  ```
- **Response**:
  - Success: `{"albums": [{"_id": "album_id", "owner": "user_id", "concert": "concert_id", "mediaItems": [...], "createdAt": "ISO_date"}]}`

### ConcertStatsAI Concept

Base path: `/api/concertStatsAI`

#### Initialize User

- **Endpoint**: `POST /api/concertStatsAI/initializeUser`
- **Description**: Initialize stats tracking for a user
- **Request Body**:
  ```json
  {
    "user": "user_id"
  }
  ```
- **Response**:
  - Success: `{}`
  - Error: `{"error": "error_message"}`

#### Log Concert

- **Endpoint**: `POST /api/concertStatsAI/logConcert`
- **Description**: Add a concert to user's history
- **Request Body**:
  ```json
  {
    "user": "user_id",
    "artist": "string",
    "venue": "string",
    "date": "ISO_date_string"
  }
  ```
- **Response**:
  - Success: `{}`
  - Error: `{"error": "error_message"}`

#### Generate Summary AI

- **Endpoint**: `POST /api/concertStatsAI/generateSummaryAI`
- **Description**: Generate AI-powered summary and recommendations
- **Request Body**:
  ```json
  {
    "user": "user_id"
  }
  ```
- **Response**:
  - Success: `{}`
  - Error: `{"error": "error_message"}`

## API Design Principles

Based on the concept implementation guidelines:

1. **All methods are either actions or queries**: Query methods are named beginning with a `_` character
2. **Single argument input/output**: Every action takes a single JSON object argument and outputs a single JSON object
3. **Primitive values only**: Both input and output use primitive values (no custom objects)
4. **Error handling**: Normal errors return `{"error": "error_message"}` instead of throwing exceptions

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `500`: Internal server error

Error responses follow the format:

```json
{
  "error": "descriptive error message"
}
```

## Data Types

- **ID**: String identifier (branded string type)
- **Date**: ISO 8601 date string
- **Empty**: Empty object `{}` for actions with no return value

## Notes

- All endpoints require JSON request bodies
- Empty request bodies are handled gracefully
- The server dynamically loads concepts from the `src/concepts/` directory
- Each concept's methods become POST endpoints under `/api/{conceptName}/`
- The server runs on port 8000 by default
- Query methods (prefixed with `_`) return arrays of the specified type
- Action methods return single objects or empty objects
