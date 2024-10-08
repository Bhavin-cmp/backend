import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const response = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`Database Connected Sucessfully ${response.connection.host}`);
  } catch (error) {
    console.log("Error Database Conection", error);
    process.exit(1);
  }
};

export default connectDB;
