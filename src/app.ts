import express from "express";

import { eventRouter } from "./routes/event.routes";
import { errorHandlerMiddleware } from "./middleware/error-handler";
import { notFoundMiddleware } from "./middleware/not-found";
import { requestIdMiddleware } from "./middleware/request-id";
import { requestLoggerMiddleware } from "./middleware/request-logger";
import { healthRouter } from "./routes/health.routes";
import { providerRouter } from "./routes/provider.routes";
import { runRouter } from "./routes/run.routes";
import { siteRouter } from "./routes/site.routes";
import { syncRouter } from "./routes/sync.routes";
import { trackerRouter } from "./routes/tracker.routes";

export const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.use(healthRouter);
app.use(trackerRouter);
app.use(eventRouter);
app.use(syncRouter);
app.use(siteRouter);
app.use(providerRouter);
app.use(runRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
