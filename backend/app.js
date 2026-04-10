import express from "express";
import cors from "cors";

import {
  requestContext,
  requestLogger,
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import financialHealthRoutes from "./routes/financialHealthRoutes.js";
import forecastingRoutes from "./routes/forecastingRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import chatRoutes from "./routes/chat.routes.js";

export const createApp = ({ enableTestRoutes = process.env.NODE_ENV !== "production" } = {}) => {
  const app = express();

  const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(requestContext);
  app.use(requestLogger);

  app.use("/api/users", userRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin/analytics", adminAnalyticsRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/bills", billRoutes);
  app.use("/api/budgets", budgetRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/recurring", recurringRoutes);
  app.use("/api/recommendations", recommendationRoutes);
  app.use("/api/financial-health", financialHealthRoutes);
  app.use("/api/forecasting", forecastingRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/transfers", transferRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/loans", loanRoutes);
  app.use("/api/chat", chatRoutes);

  if (enableTestRoutes) {
    app.use("/api/test", testRoutes);
  }

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  app.get("/", (req, res) => {
    res.send("Smart Financial Tracker API running");
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
