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

export async function enqueueImportFileUrlJob(
  processor: ResourceType,
  file_url: string,
  jobKey: string
): Promise<string> {
  const filePath = path.join(os.tmpdir(), jobKey);

  try {
    log().info({ jobKey, file_url }, "Downloading import file from URL...");

    // Fetch the remote file
    const response = await fetch(file_url);
    if (!response.ok) {
      log().error(
        { jobKey, file_url },
        `Failed to download file: ${response.status} ${response.statusText}`
      );

      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText}`
      );
    }

    // Convert to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file to a temporary path
    writeFileSync(filePath, buffer);

    log().info({ jobKey, filePath }, "File downloaded and saved successfully");
  } catch (err) {
    log().error(
      { jobKey, file_url, err },
      "Failed to download or save import file"
    );
    throw err;
  }

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
