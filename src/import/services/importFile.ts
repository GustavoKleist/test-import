import { Buffer } from "node:buffer";
import { writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { ResourceType } from "../../utils/common.js";
import { log } from "../../utils/logger.js";
import { articleWorker } from "../processors/articleProcessor.js";
import { commentsWorker } from "../processors/commentsProcessor.js";
import { userWorker } from "../processors/userProcessor.js";

const workerMap = {
  [ResourceType.enum.users]: userWorker,
  [ResourceType.enum.articles]: articleWorker,
  [ResourceType.enum.comments]: commentsWorker,
};

export async function enqueueImportFileJob(
  processor: ResourceType,
  file: File,
  jobKey: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(os.tmpdir(), jobKey);

  writeFileSync(filePath, buffer);

  const workerScript = workerMap[processor];
  if (!workerScript) {
    log().error({ jobKey }, `Unsupported processor type:${processor}`);
    throw new Error(`Unsupported processor type: ${processor}`);
  }

  const worker = new Worker(workerScript, {
    workerData: { fileName: filePath, jobKey },
  });

  worker.on("error", (err) => {
    log().error({ jobKey, err }, "Worker encountered an error");
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      log().warn({ jobKey, code }, "Worker exited with non-zero code");
    } else {
      log().info({ jobKey }, "Worker completed successfully");
    }
  });

  log().info({ jobKey }, "Import job by url enqueued");
  return jobKey;
}
