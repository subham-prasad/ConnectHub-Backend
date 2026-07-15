import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
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
