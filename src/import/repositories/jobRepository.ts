import postgres from "postgres";
import { getSql } from "../../db/index.js";
import { log } from "../../utils/logger.js";
import type { QueueStatusType } from "../models/import.js";
import { CreateJobSchema, Job } from "../models/job.js";

export class JobRepository {
  private sql: postgres.Sql;
  private readonly jobFields = [
    "id",
    "job_key",
    "resource",
    "status",
    "success",
    "errors",
  ] as const;

  constructor() {
    this.sql = getSql();
  }

  /**
   * Create a new job
   */
  async create(jobData: CreateJobSchema): Promise<Job> {
    const { job_key, resource, status } = jobData;

    const [createdJob] = (await this.sql`
      INSERT INTO jobs (job_key, resource, status)
      VALUES (${job_key}, ${resource}, ${status})
      RETURNING ${this.sql(this.jobFields)}
    `) as unknown as Job[];

    log().info({ job_key }, "Job created successfully");
    return createdJob;
  }

  /**
   * Update a job by its key
   */
  async updateJobByKey(
    jobKey: string,
    status: QueueStatusType,
    success: number = 0,
    errors: number = 0
  ): Promise<void> {
    const result = await this.sql`
      UPDATE jobs
      SET status = ${status}, success = ${success}, errors = ${errors}
      WHERE job_key = ${jobKey}
      RETURNING id
    `;

    if ((result as any[]).length === 0) {
      log().warn({ jobKey }, "No job found to update");
    } else {
      log().info({ jobKey, status, success, errors }, "Job updated");
    }
  }

  /**
   * Get a job by ID
   */
  async getById(jobId: string): Promise<Job> {
    const result = (await this.sql`
      SELECT ${this.sql(this.jobFields)} FROM jobs WHERE id = ${jobId}
    `) as unknown as Job[];

    if (result.length === 0) {
      log().error({ jobId }, "Job not found");
      throw new Error(`Job with id ${jobId} not found`);
    }

    return result[0];
  }

  /**
   * Check if a job exists by its key
   */
  async checkJobExists(jobKey: string): Promise<Job | null> {
    const result = (await this.sql`
      SELECT ${this.sql(this.jobFields)} FROM jobs WHERE job_key = ${jobKey}
    `) as unknown as Job[];

    if (result.length === 0) {
      log().info({ jobKey }, "Job not found");
      return null;
    }

    log().info({ jobKey }, "Job already exists");
    return result[0];
  }
}
