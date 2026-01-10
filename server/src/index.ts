import "express-async-errors";
import dotenv from "dotenv";
import path from "path";

// Load environment variables first from server/.env
// Try multiple possible paths
const envPaths = [
  path.resolve(process.cwd(), '.env'), // When running from server directory
  path.resolve(__dirname, '../.env'), // When running from dist directory
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`Loaded .env from: ${envPath}`);
    break;
  }
}

import "@/db/connect";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import paymentRouter from "./routes/payment";
import { errorHandler } from "./middlewares/error";
import { setupCronJobs } from "./cron";

const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: [process.env.APP_URL!, process.env.APP_URL_2!],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/payment", paymentRouter);

app.use(errorHandler);

const port = process.env.PORT || 8989;

app.listen(port, () => {
  setupCronJobs();
  console.log(`The application is running on port http://localhost:${port}`);
});
