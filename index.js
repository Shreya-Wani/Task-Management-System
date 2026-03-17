import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./src/utils/socket.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./src/db/index.js";
import errorHandler from "./src/middlewares/error.middleware.js";

import authRoutes from "./src/modules/auth/auth.routes.js";
import companyRoutes from "./src/modules/company/company.routes.js";
import userRoutes from "./src/modules/user/user.routes.js";
import planRoutes from "./src/modules/plan/plan.routes.js";
import webhookRoutes from "./src/modules/webhook/webhook.routes.js";
import projectRoutes from "./src/modules/project/project.routes.js";
import taskRoutes from "./src/modules/task/task.routes.js";
import dashboardRoutes from "./src/modules/dashboard/dashboard.routes.js";
import fileRoutes from "./src/modules/file/file.routes.js";

import planExpiryCron from "./src/cron/planExpiry.cron.js";

const app = express();

connectDB();

app.use(cors());

app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhooks/stripe") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/plans", planRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/files", fileRoutes);

app.use(errorHandler);

app.get("/payment-success", (req, res) => {
  res.send("Payment successful");
});

app.get("/payment-failed", (req, res) => {
  res.send("Payment failed");
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  planExpiryCron();
});