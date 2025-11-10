import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "url";
import { isMainThread, workerData } from "worker_threads";
import { log } from "../../utils/logger.js";
import { QueueStatusType } from "../models/import.js";
import { User, UserSchema } from "../models/user.js";
import { JobRepository } from "../repositories/jobRepository.js";
import { UserRepository } from "../repositories/userRepository.js";

export const userWorker = fileURLToPath(import.meta.url);

class HighProcessor {
  private data: Array<User> = [];
  private bufferLimit = 1000;
  private userRepository = new UserRepository();
  private jobRepository = new JobRepository();
  private errorCounter = 0;
  private successCounter = 0;

  constructor(private jobKey: string) {}

  size() {
    return this.data.length;
  }

  reset() {
    this.data = [];
  }

  async add(line: string) {
    const validLine = this.parseLine(line);
    if (validLine === null) {
      this.errorCounter++;
      return;
    }

    this.data.push(validLine);

    if (this.data.length === this.bufferLimit) {
      await this.userRepository.bulkInsert([...this.data]).then((counter) => {
        this.successCounter += counter;
        this.errorCounter += this.bufferLimit - counter;
      });

      this.reset();
    }
  }

  parseLine(line: string): null | User {
    try {
      const tokens = line.split(",");

      const obj = {
        id: tokens[0],
        email: tokens[1],
        name: tokens[2],
        role: tokens[3],
        active: ["true", "yes", "1", "y"].includes(tokens[4].toLowerCase()),
        created_at: new Date(tokens[5]),
        updated_at: new Date(tokens[6]),
      };

      return UserSchema.parse(obj);
    } catch (error) {
      log().error(
        { jobKey: this.jobKey, errors: (error as Error).message },
        "Error parsing user line"
      );
      return null;
    }
  }

  async finish() {
    if (this.data.length > 0) {
      await this.userRepository.bulkInsert([...this.data]).then((counter) => {
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

  const stream = createReadStream(fileName, "utf-8");
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  rl.on("line", async (line) => {
    processor.add(line);
  });

  rl.on("close", async () => {
    processor.finish();
  });
}
