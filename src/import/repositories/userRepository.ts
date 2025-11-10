import postgres from "postgres";
import { getSql } from "../../db/index.js";
import { log } from "../../utils/logger.js";
import type { User } from "../models/user.js";

export class UserRepository {
  private sql: postgres.Sql;

  constructor() {
    this.sql = getSql();
  }

  /**
   * Bulk insert users.
   * Ignores conflicts (ON CONFLICT DO NOTHING).
   * Returns the number of inserted rows.
   */
  async bulkInsert(users: User[]): Promise<number> {
    if (users.length === 0) return 0;

    try {
      // Deduplicate users by email before inserting
      const uniqueUsers = this.deduplicateUsersByEmail(users);

      const insertedRows = (await this.sql`
        INSERT INTO users ${this.sql(uniqueUsers)}
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          active = EXCLUDED.active,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
        RETURNING id
      `) as { id: string }[];

      log().info(
        { insertedCount: insertedRows.length },
        "Users inserted successfully"
      );
      return insertedRows.length;
    } catch (err) {
      log().error({ err }, "Failed to bulk insert users");
      return 0;
    }
  }

  // Helper function to deduplicate users by email
  deduplicateUsersByEmail(users: User[]): User[] {
    const uniqueUsers = new Map<string, User>();

    for (const user of users) {
      uniqueUsers.set(user.email, user);
    }

    return Array.from(uniqueUsers.values());
  }
}
