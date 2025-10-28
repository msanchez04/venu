# UserAccount Concept Specification

**concept** UserAccount

**purpose** represent a registered user and handles authentication for the application

**principle** after a user registers with a unique email and password, they can log in using those credentials to access the system

**state**
a set of Users with
userID ID
name String
email String
password String
createdAt DateTime

**actions**
register (name: String, email: String, password: String): (user: User)
**requires** no existing user with the same email
**effects** creates and stores a new UserAccount with current time as createdAt

login (email: String, password: String): (success: Boolean, user: User?, userName: String?)
**requires** user with matching email exists
**effects** returns true, user ID, and userName if password matches; false otherwise

updateName (user: User, newName: String): Empty
**requires** user exists
**effects** updates the user's name to newName

updatePassword (user: User, currentPassword: String, newPassword: String): Empty
**requires** user exists and currentPassword matches user's password
**effects** updates the user's password to newPassword
