import pino, { Logger } from "pino";

let logger: Logger | null = null;

export function log(): Logger {
  if (logger) return logger;

  logger = pino();
  return logger;
}
