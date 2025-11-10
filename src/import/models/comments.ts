import z from "zod";

/**
 * Validates that a text body contains 500 words or fewer.
 */
const validateWordCount = (body: string) => {
  const words = body
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  return words.length <= 500;
};

export const CommentSchema = z
  .object({
    id: z
      .string()
      .min(1, "Comment ID cannot be empty")
      .describe("Unique identifier for the comment"),
    article_id: z
      .string()
      .min(1, "Article ID is required")
      .describe("ID of the article the comment belongs to"),
    user_id: z
      .string()
      .min(1, "User ID is required")
      .describe("ID of the user who made the comment"),
    body: z
      .string()
      .min(1, "Comment body cannot be empty")
      .refine(validateWordCount, {
        message: "Comment body must be 500 words or less",
      })
      .describe("Text content of the comment (maximum 500 words)"),
    created_at: z
      .date()
      .default(() => new Date())
      .describe("Timestamp when the comment was created"),
  })
  .refine((data) => data.body.trim().length > 0, {
    message: "Comment body cannot be just whitespace",
    path: ["body"],
  });

export type Comment = z.infer<typeof CommentSchema>;
