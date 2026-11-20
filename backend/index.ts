import env from "./config/env.config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routers";
import middleware from "./middleware";
import { startCleanupJob } from "./cron";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  }),
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (_req, res) =>
  res.json({ code: 200, message: "Server is running successfully." }),
);
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", router);
app.use(middleware.ErrorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running on : http://localhost:${env.PORT}`);
});

startCleanupJob();
