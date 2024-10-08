import dotenv from "dotenv";
import express from "express";

dotenv.config();
import connectDB from "./db/db.js";

const app = express();

connectDB();

/*
const connectDB = (async () => {
  try {
    const res = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("Error : ", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is running on ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Error : ", error);
    throw error;
  }
})(); */
