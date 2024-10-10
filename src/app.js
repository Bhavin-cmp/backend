import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(express.static("public"));

app.use(cookieParser());

//* Routes import
import userRouter from "./routes/user.routes.js";

//* routes declaration
//? so url create like http://localhost:8080/api/v1/users/ ,
//? request come here after it takes to the userRouter and
//? in userRouter wi define which method we are using

app.use("/api/v1/users", userRouter);

export { app };
