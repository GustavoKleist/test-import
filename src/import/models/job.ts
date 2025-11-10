import z from "zod";
import { ResourceType } from "../../utils/common.js";
import { QueueStatusType } from "./import.js";

export const JobSchema = z.object({
  id: z
    .uuid("Job ID must be a valid UUID")
    .describe("Unique identifier for the job"),
  job_key: z
    .string()
    .min(1, "Job key cannot be empty")
    .max(100, "Job key must be less than 100 characters")
    .describe("Unique key identifying this job instance"),
  resource: ResourceType.describe("Type of resource associated with the job"),
  status: QueueStatusType.describe("Current processing status of the job"),
  success: z
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe("Number of successfully processed items for this job"),
  errors: z
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe("Number of failed items encountered during processing"),
});

export const CreateJobSchema = JobSchema.pick({
  job_key: true,
  resource: true,
  status: true,
}).describe("Schema for creating a new background job");

export type Job = z.infer<typeof JobSchema>;
export type CreateJobSchema = z.infer<typeof CreateJobSchema>;
