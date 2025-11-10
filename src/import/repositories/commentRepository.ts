import postgres from "postgres";
import { getSql } from "../../db/index.js";
import { log } from "../../utils/logger.js";
import { Comment } from "../models/comments.js";

export class CommentRepository {
  private sql: postgres.Sql;

  constructor() {
    this.sql = getSql();
  }

  async bulkInsert(comments: Array<Comment>): Promise<number> {
    if (comments.length === 0) return 0;

    try {
      const insertedRows = (await this.sql`
      INSERT INTO comments ${this.sql(comments)} 
      ON CONFLICT (id) DO NOTHING 
      RETURNING id`) as { id: string }[];

      log().info(
        { insertedCount: insertedRows.length },
        "Articles inserted successfully"
      );
      return insertedRows.length;
    } catch (err) {
      log().warn({ err }, "comments constraint violation");
      return 0;
    }
  }
}
