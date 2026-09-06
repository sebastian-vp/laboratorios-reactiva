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

// GET: un thread junto a sus comentarios
app.get("/api/threads/:id", async (request, response) => {
  const id = Number(request.params.id);

  const thread = await Post.findOne({ id, thread: null });
  if (!thread) {
    response.status(404).json({ error: "thread not found" });
    return;
  }

  const comments = await Post.find({ thread: id });
  response.json({ thread, comments });
});

// POST: crear un comentario dentro de un thread
app.post("/api/threads/:id", async (request, response) => {
  const threadId = Number(request.params.id);
  const { content, author, parent } = request.body;

  const thread = await Post.findOne({ id: threadId, thread: null });
  if (!thread) {
    response.status(404).json({ error: "thread not found" });
    return;
  }

  if (parent) {
    const parentComment = await Post.findOne({ id: parent, thread: threadId });
    if (!parentComment) {
      response.status(400).json({ error: "parent must be a comment of this thread" });
      return;
    }
  }

  const last = await Post.findOne().sort({ id: -1 });
  const nextId = Number(last?.id ?? 0) + 1;

  const comment = new Post({
    id: nextId,
    content,
    author: author || null,
    thread: threadId,
    parent: parent ?? null,
  });

  const saved = await comment.save();
  response.status(201).json(saved);
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});