import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "./utils/ApiError.js";
import dotenv from "dotenv";

const app = express();

dotenv.config();

console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
console.log("hoiii")
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    // credentials: true,
  })
);

app.use(express.json({ limit: process.env.JSON_LIMIT }));
app.use(express.urlencoded({ extended: true })); //kind of space keywords
app.use(express.static("public"));
app.use(cookieParser());

import UserRouter from "./routes/user.routes.js";

app.use("/api/v1/user", UserRouter);

app.get("/", (req, res) => {
  res.send("connect Hub Backend is running");
});

app.get("/subo", (req, res) => {
  res.send("This is Subonda The greatt");
});

app.use(
  (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;

    const errors = err instanceof ApiError ? err.errors : [];

    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
      errors,
    });
  }
);
export default app;
