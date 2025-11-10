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
      const insertedRows = (await this.sql`
        INSERT INTO users ${this.sql(users)}
        ON CONFLICT (email) DO NOTHING
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
}
