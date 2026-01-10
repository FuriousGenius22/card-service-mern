import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from server/.env
// __dirname in compiled JS will be dist/db, so go up two levels to server root
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MONGO_URI environment variable is missing!");
  console.error("Please check your .env file in the server directory.");
  throw new Error("Database uri is missing!");
}

export const dbConnect = () => {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("db connected!");
    })
    .catch((error) => {
      console.log("db connection failed: ", error.message);
    });
};
