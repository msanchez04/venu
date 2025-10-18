Functional Design Assignment
Problem Statement
Problem Domain: Concert Memory Organization

Currently, live music events such as concerts have become an integral part of entertainment culture. Millions of people, like myself, attend one or more concerts every year which typically results in nearly every attendee recording photos and videos. These memories, however, often end up scattered across devices and apps. As someone who attends concerts regularly, I’ve personally found it frustrating to later sort through a messy camera roll to find the highlights of a show. This domain is of particular interest to me because concerts are meaningful experiences, and being able to easily relive them makes them more special.

Problem: Filtering Concert Memories

Concert fanatics usually capture many photos and videos at events in order to relive the experience after the concert. Sometimes this becomes difficult as revisiting these memories becomes a chore because the content is disorganized and mixed with unrelated media. Current photo apps store memories generically, without tools tailored to concert experiences. Users lack an easy way to collect, categorize, and personalize their concert content to relive these moments in a meaningful way.

Application Pitch
Name: Venu

Motivation: Concertgoers want a simple way to revisit concerts, group them by show without digging through hundreds of unrelated pictures— Venu solves this by turning chaotic camera rolls into organized concert journals.

Key Features:

Conept Design
concept UserAccount

purpose
Represents a registered user and handles authentication for the application.

principle
Every user must have a valid account to access or modify concerts, media, or AI-generated summaries.

state
a set of Users with

userID ID

name String

email String

password String

createdAt DateTime

actions

register (name: String, email: String, password: String): (user: User)

requires no existing user with the same email

effect creates and stores a new UserAccount with current time as createdAt

login (email: String, password: String): (success: Boolean)

requires user with matching email exists

effect returns true if password matches; false otherwise

concept ConcertEvent [User, Artist]

purpose
Represents a single concert that a user attended, serving as the hub for related data (media, summaries, stats).

principle
Each concert is a distinct event linked to one or more artists and one user; all media and summaries are tied to this event.

state
a set of ConcertEvents with

concertID ID

owner User

artist Artist

date DateTime

venue String

city String

rating Number (optional)

actions

addConcert (user: User, artist: Artist, date: DateTime, venue: String, city: String): (concert: ConcertEvent)

requires no ConcertEvent exists for (user, artist, date, venue)

effect creates and saves a new ConcertEvent linked to the user

editConcertDetails (concert: ConcertEvent, newArtist?: Artist, newDate?: DateTime, newVenue?: String, newCity?: String)

requires concert exists

effect updates any specified concert details

concept MediaAlbum [User, ConcertEvent]

purpose
Stores and organizes photos and videos from a concert, separate from the user’s general camera roll.

principle
Each concert attended by a user has exactly one MediaAlbum; all photos or videos from that event are stored here.

state
a set of MediaAlbums with

albumID ID

owner User

concert ConcertEvent

mediaItems Set of MediaFile

timestamp DateTime

actions

createAlbum (user: User, concert: ConcertEvent): (album: MediaAlbum)

requires concert exists and no album exists for (user, concert)

effect creates a new MediaAlbum linked to the concert and owned by the user

uploadMedia (user: User, album: MediaAlbum, file: MediaFile, timestamp: DateTime)

requires album.owner = user

effect adds the new media file to the album

concept ConcertStatsAI [User]

purpose
Automatically summarizes a user’s concert history and generates personalized artist recommendations.

principle
Given a user’s concert log, the AI produces an up-to-date summary and recommendations after each new concert is added.

state
a set of StatsRecords with

user User

concertHistory Set of ConcertEvent

summary String

recommendations List of String

actions

initializeUser (user: User)

requires user exists and no StatsRecord exists for user

effect creates an empty StatsRecord for user

logConcert (user: User, artist: String, venue: String, date: DateTime)

requires user exists

effect appends concert to user’s concertHistory

generateSummaryAI (user: User)

requires user has at least one logged concert

effect calls the LLM to summarize the user’s concert history and suggest 2–3 new artists, updating summary and recommendations

Synchronizations

sync register

when

UserAccount.register (name, email, password): (user)

then

ConcertStatsAI.initializeUser (user)

sync login

when
UserAccount.login (email, password): (success)

then proceed to main dashboard (no backend state updates triggered)

sync uploadMedia

when
MediaAlbum.uploadMedia (user, album, file, timestamp)

then
ConcertEvent.editConcertDetails (concert: album.concert)
update the concert’s metadata to include a reference to the new media item (for example, incrementing a media count or marking it as “hasMedia = true”)

and
ConcertStatsAI.generateSummaryAI (user)

sync generateAISummary

when
ConcertEvent.addConcert (user, artist, date, venue, city): (concert)

then
ConcertStatsAI.logConcert (user, artist, venue, date)
and
ConcertStatsAI.generateSummaryAI (user)
and
MediaAlbum.createAlbum (user, concert)

Brief Note
ConcertEvent is the central concept, representing each concert attended. All other concepts essentially branch from it.

MediaAlbum handles the storage and organization of the user’s photos and videos. It’s created per concert automatically and ties directly back to every ConcertEvent.

ConcertStats aggregates data across all the user’s ConcertEvents and MediaAlbums to show streaks and counts.

Notification keeps users engaged and reduces the chance they forget to upload or miss an upcoming show. Additionally reminds tagged friends to upload their own footage.
