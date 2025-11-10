import postgres from "postgres";
import { getSql } from "../../db/index.js";
import { log } from "../../utils/logger.js";
import { Article } from "../models/article.js";

export class ArticleRepository {
  private sql: postgres.Sql;

  constructor() {
    this.sql = getSql();
  }

  async bulkInsert(articles: Array<Article>): Promise<number> {
    if (articles.length === 0) return 0;

    try {
      const insertedRows = (await this.sql`
        INSERT INTO articles ${this.sql(articles)} 
        ON CONFLICT (slug) DO NOTHING 
        RETURNING id
      `) as { id: string }[];

      log().info(
        { insertedCount: insertedRows.length },
        "Articles inserted successfully"
      );
      return insertedRows.length;
    } catch (err) {
      log().warn({ err }, "articles constraint violation");
      return 0;
    }
  }
}
