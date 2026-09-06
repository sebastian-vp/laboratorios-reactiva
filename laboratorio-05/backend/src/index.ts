import express from "express";
import mongoose from "mongoose";
import { Post } from "./models/post.ts";

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/lab5")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.log("Error conectando a MongoDB:", error.message));

const app = express();
app.use(express.json());

// GET: devolver todos los threads
app.get("/api/threads", async (_request, response) => {
  const threads = await Post.find({ thread: null });
  response.json(threads);
});

// POST: crear un thread nuevo
app.post("/api/threads", async (request, response) => {
  const { content, author } = request.body;

  const last = await Post.findOne().sort({ id: -1 });
  const nextId = Number(last?.id ?? 0) + 1;

  const thread = new Post({
    id: nextId,
    content,
    author: author || null,
    thread: null,
    parent: null,
  });

  const saved = await thread.save();
  response.status(201).json(saved);
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});