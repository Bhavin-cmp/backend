import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/db.js";

dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(`server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo Db Connection Failed !!", err);
  });
