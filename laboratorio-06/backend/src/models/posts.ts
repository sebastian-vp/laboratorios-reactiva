import dotenv from "dotenv";
dotenv.config();

import mongoose, { Schema } from "mongoose";

const url = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DBNAME || "lab6-dev";

mongoose.set("strictQuery", false);
if (url) {
  mongoose.connect(url, { dbName }).catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });
}

export interface Post {
  content: string;
  author?: string;
  thread?: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
}

// --- INICIO CAMBIO P1: Implementación de la función filterPostsByWord ---
export function filterPostsByWord(posts: Post[], query: string): Post[] {
  const cleanQuery = query
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");

  if (posts.length === 0 || cleanQuery === "") {
    return [];
  }

  return posts.filter((post) => {
    if (!post.content) return false;
    const words = post.content
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((word) => word.length > 0);
    return words.includes(cleanQuery);
  });
}
// --- FIN CAMBIO P1 ---

// --- INICIO CAMBIO P4: Corrección de validación case-insensitive de autores prohibidos ---
const BANNED = ["huevito rey", "matías toro", "memes es mal ramo"];
function isNotBanned(v: string) {
  if (!v) return true;
  return !BANNED.includes(v.trim().toLowerCase());
}
// --- FIN CAMBIO P4 ---

const postSchema = new mongoose.Schema<Post>(
  {
    content: { type: String, required: true, minlength: 1, maxlength: 300 },
    author: {
      type: String,
      validate: {
        validator: function (v: string) {
          return isNotBanned(v);
        },
        message: (props) => `${props.value} is not allowed as a username!`,
      },
    },
    thread: { type: Schema.Types.ObjectId, ref: "Post", default: null },
    parent: { type: Schema.Types.ObjectId, ref: "Post", default: null },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// --- INICIO CAMBIO P3: Transformación toJSON (id en lugar de _id y sin __v) antes de compilar el modelo ---
postSchema.set("toJSON", {
  transform: (
    _,
    returnedObject: { id?: string; _id?: mongoose.Types.ObjectId; __v?: number }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
// --- FIN CAMBIO P3 ---

const PostModel = mongoose.model<Post>("Post", postSchema);

export default PostModel;
