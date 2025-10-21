import { Collection, Db, MongoServerError } from "mongodb";
import { ID } from "../../utils/types.ts";
import { freshID } from "../../utils/database.ts";

// Define the prefix for MongoDB collections to avoid naming conflicts
const PREFIX = "UserAccount.";

// Type alias for the User ID for clarity
type User = ID;

/**
 * Represents the document structure for a user in the database.
 * state: a set of Users with
 *  userID ID
 *  name String
 *  email String
 *  password String
 *  createdAt DateTime
 */
interface UserDoc {
  _id: User;
  name: string;
  email: string;
  password: string; // NOTE: In a production app, this should be a securely hashed password.
  createdAt: Date;
}

/**
 * @concept UserAccount
 * @purpose Represents a registered user and handles authentication for the application.
 */
export default class UserAccountConcept {
  private readonly users: Collection<UserDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection<UserDoc>(PREFIX + "users");
  }

  /**
   * Creates an instance and ensures indexes are created before use.
   */
  static async initialize(db: Db): Promise<UserAccountConcept> {
    const users = db.collection<UserDoc>(PREFIX + "users");
    await users.createIndex({ email: 1 }, { unique: true });
    return new UserAccountConcept(db);
  }

  /**
   * Registers a new user in the system.
   * @param name The user's full name.
   * @param email The user's email address. Must be unique.
   * @param password The user's chosen password.
   * @returns An object containing the new user's ID, or an error object if registration fails.
   *
   * @requires no existing user with the same email
   * @effect creates and stores a new UserAccount with current time as createdAt
   */
  async register({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: User } | { error: string }> {
    // Check if a user with the given email already exists to provide a clean error.
    // This is a "user-friendly" check before attempting the database operation.
    const existingUser = await this.users.findOne({ email });
    if (existingUser) {
      return { error: "A user with this email already exists." };
    }

    const newUser: UserDoc = {
      _id: freshID(),
      name,
      email,
      password,
      createdAt: new Date(),
    };

    try {
      await this.users.insertOne(newUser);
      return { user: newUser._id };
    } catch (e) {
      // The `instanceof` check safely narrows the type of `e` from `unknown`.
      // This is the "race-condition" safe check, as the unique index is the source of truth.
      if (e instanceof MongoServerError && e.code === 11000) {
        return { error: "A user with this email already exists." };
      }
      console.error("Failed to register user:", e);
      return { error: "An unexpected error occurred during registration." };
    }
  }

  /**
   * Attempts to log a user in with their email and password.
   * @param email The user's email address.
   * @param password The user's password.
   * @returns An object indicating success or failure. On success, includes the user's ID.
   *
   * @requires user with matching email exists
   * @effect returns true if password matches; false otherwise
   */
  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<
    { success: true; user: User } | { success: false } | { error: string }
  > {
    const user = await this.users.findOne({ email });

    // For security, we return the same response for "user not found" and "incorrect password".
    if (!user || user.password !== password) {
      return { success: false };
    }

    return { success: true, user: user._id };
  }
}
