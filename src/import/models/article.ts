import z from "zod";

/**
 * Regex for kebab-case slugs:
 * - Only lowercase letters, numbers, and single hyphens between parts.
 * - No leading/trailing hyphens, no consecutive hyphens.
 */
const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const ArticleSchema = z
  .object({
    id: z
      .string()
      .min(1, "ID cannot be empty")
      .describe("Unique identifier for the article"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(200, "Slug must be less than 200 characters")
      .regex(
        kebabCaseRegex,
        "Slug must be in kebab-case (lowercase letters, numbers, and hyphens only)"
      )
      .describe("Kebab-case identifier for the article"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
      .describe("Title of the article"),
    body: z
      .string()
      .min(1, "Body content cannot be empty")
      .describe("Full text content of the article"),
    author_id: z
      .string()
      .min(1, "Author ID is required")
      .describe("Identifier of the author who created the article"),
    tags: z
      .array(z.string().min(1, "Tag cannot be empty"))
      .max(20, "Too many tags (max 20 allowed)")
      .default([])
      .describe("List of tags associated with the article"),
    published_at: z
      .union([z.date(), z.string().datetime()])
      .nullable()
      .default(null)
      .describe("Publication date of the article (nullable)"),
    status: z
      .enum(["draft", "published"])
      .default("draft")
      .describe("Publication status of the article"),
  })
  .refine((data) => !(data.status === "draft" && data.published_at !== null), {
    message: "Draft articles cannot have a published_at date",
    path: ["published_at"],
  })
  .refine(
    (data) => !(data.status === "published" && data.published_at === null),
    {
      message: "Published articles must include a published_at date",
      path: ["published_at"],
    }
  );

export type Article = z.infer<typeof ArticleSchema>;
