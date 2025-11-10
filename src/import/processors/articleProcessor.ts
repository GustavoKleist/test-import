import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "url";
import { isMainThread, workerData } from "worker_threads";
import z from "zod";
import { log } from "../../utils/logger.js";
import { Article, ArticleSchema } from "../models/article.js";
import { QueueStatusType } from "../models/import.js";
import { ArticleRepository } from "../repositories/articleRepository.js";
import { JobRepository } from "../repositories/jobRepository.js";

export const articleWorker = fileURLToPath(import.meta.url);

class HighProcessor {
  private data: Array<Article> = [];
  private bufferLimit = 1000;
  private articleRepository = new ArticleRepository();
  private jobRepository = new JobRepository();
  private errorCounter = 0;
  private successCounter = 0;
  private lineCounter = 0;

  constructor(private jobKey: string) {}

  size() {
    return this.data.length;
  }

  reset() {
    this.data = [];
  }

  async add(line: string) {
    this.lineCounter++;
    const validLine = this.parseLine(line);
    if (validLine === null) {
      this.errorCounter++;
      return;
    }

    this.data.push(validLine);

    if (this.data.length === this.bufferLimit) {
      await this.articleRepository
        .bulkInsert([...this.data])
        .then((counter) => {
          this.successCounter += counter;
          this.errorCounter += this.bufferLimit - counter;
        });
      this.reset();
    }
  }

  parseLine(line: string): null | Article {
    try {
      const obj = JSON.parse(line);

      return ArticleSchema.parse({
        ...obj,
        published_at:
          obj.published_at !== undefined ? new Date(obj.published_at) : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        log().error(
          { jobKey: this.jobKey, errors: error.issues },
          "Error parsing article line"
        );
      } else {
        log().error(
          { jobKey: this.jobKey, errors: (error as Error).message },
          "Error parsing article line"
        );
      }
      return null;
    }
  }

  async finish() {
    if (this.data.length > 0) {
      await this.articleRepository
        .bulkInsert([...this.data])
        .then((counter) => {
          this.successCounter += counter;
          this.errorCounter += this.data.length - counter;
        });
    }

    this.jobRepository.updateJobByKey(
      this.jobKey,
      QueueStatusType.enum.finished,
      this.successCounter,
      this.errorCounter
    );
  }
}

if (!isMainThread) {
  await setTimeout(3000);
  const { fileName, jobKey } = workerData;
  const jobRepository = new JobRepository();

  const processor = new HighProcessor(jobKey);

  await jobRepository.updateJobByKey(jobKey, QueueStatusType.enum.processing);

  const rl = createInterface({
    input: createReadStream(fileName, "utf-8"),
    crlfDelay: Infinity,
  });

  rl.on("line", async (line) => {
    processor.add(line);
  });

  rl.on("close", async () => {
    processor.finish();
  });
}
