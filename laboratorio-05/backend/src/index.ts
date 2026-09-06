import express from "express";
import mongoose from "mongoose";

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/lab5")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.log("Error conectando a MongoDB:", error.message));

const app = express();
app.use(express.json());

app.listen(3001, () => {
  console.log("Server running on port 3001");
});