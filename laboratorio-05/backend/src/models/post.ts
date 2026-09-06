import mongoose from "mongoose";

const bannedAuthors = ["Huevito rey", "Matías Toro", "Memes es mal ramo"];

const postSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 300,
  },
  author: {
    type: String,
    default: null,
    validate: {
      validator: (value: string | null) => !bannedAuthors.includes(value ?? ""),
      message: "Ese nombre de autor no está permitido",
    },
  },
  thread: { type: Number, default: null },
  parent: { type: Number, default: null },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
}, {
  timestamps: true,
});

postSchema.set("toJSON", {
  transform: (_document, returnedObject: { _id?: unknown; __v?: unknown }) => {
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export const Post = mongoose.model("Post", postSchema);