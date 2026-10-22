import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { ApiError } from "./errors/ApiError";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(
  (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      });
      return;
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      Number(error.status) === 413
    ) {
      res.status(413).json({ error: "Uploaded file must be no larger than 5 MB." });
      return;
    }
    req.log.error({ err: error }, "Unhandled API error");
    res.status(500).json({ error: "An unexpected server error occurred." });
  },
);

export default app;
