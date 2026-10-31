import env from "./config/env.config";
import express from "express";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routers";
import middleware from "./middleware";
import { startCleanupJob } from "./cron";

const app = express();

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", router);
app.use(middleware.ErrorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running on : http://localhost:${env.PORT}`);
});

startCleanupJob();
