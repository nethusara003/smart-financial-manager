import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { logInfo } from "./utils/logger.js";
import createApp from "./app.js";

dotenv.config();
connectDB();

logInfo("server.bootstrap.start", {
  service: "sft-backend",
  environment: process.env.NODE_ENV || "development",
});
const app = createApp({
  enableTestRoutes: process.env.NODE_ENV !== "production",
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logInfo("server.bootstrap.ready", {
    service: "sft-backend",
    port: Number(PORT),
    environment: process.env.NODE_ENV || "development",
  });
  logInfo("server.worker.info", {
    message: "Background schedulers run in worker.js",
  });
});
