import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./src/db/index.js";
import errorHandler from "./src/middlewares/error.middleware.js";

import authRoutes from "./src/routes/auth.routes.js";
import companyRoutes from "./src/routes/company.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import planRoutes from "./src/routes/plan.routes.js";
// import projectRoutes from "./src/routes/project.routes.js";
// import taskRoutes from "./src/routes/task.routes.js";

import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/plans", planRoutes);
// app.use("/api/v1/projects", projectRoutes);
// app.use("/api/v1/tasks", taskRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});