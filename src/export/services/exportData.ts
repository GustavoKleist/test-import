import { getSql } from "../../db/index.js";
import { FormatType } from "../../utils/common.js";
import { log } from "../../utils/logger.js";

async function* exportPaginatedTable(table: string, format: FormatType) {
  const sql = getSql();

  if (format !== FormatType.enum.ndjson) {
    log().warn({ format }, `Unsupported format for ${table}`);
    return;
  }

  log().info({ table, format }, `Starting ${table} export`);

  const limit = 5000;
  let offset = 0;
  let result;

  do {
    result = await sql`SELECT * FROM ${sql(
      table
    )} ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
    offset += limit;

    if (result.length > 0) {
      yield result;
    }
  } while (result.length > 0);

  log().info({ table, format }, `Finished ${table} export`);
}

export const exportUsers = (format: FormatType) =>
  exportPaginatedTable("users", format);
export const exportArticles = (format: FormatType) =>
  exportPaginatedTable("articles", format);
export const exportComments = (format: FormatType) =>
  exportPaginatedTable("comments", format);
