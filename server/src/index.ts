import "express-async-errors";
import "@/db/connect";
import express from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";

import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import { errorHandler } from "./middlewares/error";
import { isAuth } from "./middlewares/auth";

const app = express();

const publicPath = path.join(__dirname, "./books");

// app.use((req, res, next) => {
//   req.on("data", (chunk) => {
//     req.body = JSON.parse(chunk);
//     next();
//   });
// });
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

app.use(errorHandler);

const port = process.env.PORT || 8989;

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port}`);
});
