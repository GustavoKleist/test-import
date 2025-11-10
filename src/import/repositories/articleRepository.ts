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
      // Deduplicate users by email before inserting
      const uniqueUsers = this.deduplicateUsersBySlug(articles);

      const insertedRows = (await this.sql`
        INSERT INTO articles ${this.sql(uniqueUsers)} 
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          body = EXCLUDED.body,
          author_id = EXCLUDED.author_id,
          tags = EXCLUDED.tags,
          published_at = EXCLUDED.published_at,
          status = EXCLUDED.status
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

  // Helper function to deduplicate users by email
  deduplicateUsersBySlug(articles: Article[]): Article[] {
    const uniqueArticles = new Map<string, Article>();

    for (const article of articles) {
      uniqueArticles.set(article.slug, article);
    }

    return Array.from(uniqueArticles.values());
  }
}
