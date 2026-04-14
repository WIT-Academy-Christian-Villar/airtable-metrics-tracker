import pino from "pino";

import { APP_NAME } from "./constants";
import { env } from "./env";

export const logger = pino({
  name: APP_NAME,
  level: env.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
});
