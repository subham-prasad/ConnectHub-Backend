import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { error } from "node:console";

// dotenv.config();

dotenv.config({
  path: ".env",
});


connectDB()
  .then(() => {
    
    const PORT = process.env.PORT || 8000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running at port: ${PORT}`);
    });

    server.on("error", (error) => {
      console.log("err: ", error);
      throw error;
    });

  })
  .catch((err) => {
    console.log("Mongo DB connection failed !!!:", err);
  });


const PORT= process.env.PORT

