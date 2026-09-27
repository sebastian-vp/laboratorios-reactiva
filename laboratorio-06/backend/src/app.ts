import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import PostModel from "./models/posts";

const app = express();
app.use(express.json());

const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};
app.use(requestLogger);

app.get("/api/threads", async (request, response, next) => {
  try {
    const posts = await PostModel.find({ thread: null });
    response.json(posts);
  } catch (error) {
    next(error);
  }
});

app.get("/api/threads/:id", async (request, response, next) => {
  try {
    const id = request.params.id;
    const [thread, posts] = await Promise.all([
      PostModel.findById(id),
      PostModel.find({ thread: id }),
    ]);
    if (thread) {
      if (thread.thread !== null) {
        return response.status(400).json({ error: "Not a thread" });
      }

      response.json({ thread: thread, comments: posts });
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/threads", async (request, response, next) => {
  try {
    const body = request.body;

    const post = new PostModel({
      content: body.content,
      author: body.author,
      thread: null,
    });

    const savedPost = await post.save();
    response.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
});

// --- INICIO CAMBIO P5: Validación de existencia del thread y pertenencia del parent al crear comentario ---
app.post("/api/threads/:id", async (request, response, next) => {
  try {
    const body = request.body;
    const threadId = request.params.id;

    const thread = await PostModel.findById(threadId);
    if (!thread || thread.thread !== null) {
      return response.status(404).json({ error: "Thread not found" });
    }

    if (body.parent !== undefined && body.parent !== null) {
      const parentPost = await PostModel.findById(body.parent);
      if (!parentPost || parentPost.thread?.toString() !== threadId) {
        return response
          .status(400)
          .json({ error: "Parent comment does not belong to this thread" });
      }
    }

    const post = new PostModel({
      content: body.content,
      author: body.author,
      thread: threadId,
      parent: body.parent ?? null,
    });

    const savedPost = await post.save();
    response.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
});
// --- FIN CAMBIO P5 ---

// --- INICIO CAMBIO P6: Habilitación de runValidators en PUT /api/posts/:id ---
app.put("/api/posts/:id", async (request, response, next) => {
  try {
    const body = request.body;
    const id = request.params.id;

    const updatedPost = await PostModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (updatedPost) {
      response.json(updatedPost);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});
// --- FIN CAMBIO P6 ---

app.use(express.static("dist"));

// --- INICIO CAMBIO P3: Middleware unknownEndpoint (404 JSON) y orden correcto de middlewares ---
const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).json({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (
  error: { name: string; message: string },
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.error(error.message);
  console.error(error.name);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);
// --- FIN CAMBIO P3 ---

export default app;
