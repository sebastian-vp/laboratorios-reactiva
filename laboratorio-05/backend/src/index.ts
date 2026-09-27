import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import mongoose from "mongoose";
import path from "node:path";
import { Post } from "./models/post.ts";

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI as string, { dbName: process.env.MONGODB_DBNAME as string })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.log("Error conectando a MongoDB:", error.message));

const app = express();
app.use(express.json());
app.use(express.static("dist"));

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

// PUT: actualizar (sobrescribir) un post — thread o comentario
app.put("/api/posts/:id", async (request, response) => {
  const id = Number(request.params.id);
  const { content, author, likes, dislikes, thread, parent } = request.body;

  const post = await Post.findOne({ id });
  if (!post) {
    response.status(404).json({ error: "post not found" });
    return;
  }

  post.content = content;
  post.author = author;
  post.likes = likes;
  post.dislikes = dislikes;
  post.thread = thread;
  post.parent = parent;

  const saved = await post.save();
  response.json(saved);
});

app.use((request, response, next) => {
  if (request.method === "GET" && !request.path.startsWith("/api")) {
    response.sendFile(path.resolve("dist/index.html"));
  } else {
    next();
  }
});

const errorHandler = (error: Error, _request: Request, response: Response, next: NextFunction) => {
  console.error(error.message);

  if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
    return;
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

