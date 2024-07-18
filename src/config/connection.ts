import mongoose from "mongoose";
import { envs } from "../constants/environment";

const connection = async () => {
  try {
    await mongoose.connect(envs.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw new Error("Error connecting to MongoDB");
  }
};

export default connection;
