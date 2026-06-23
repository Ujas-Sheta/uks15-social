import "dotenv/config";
import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import postRoutes from "./routes/posts.js";
import usersRoutes from "./routes/users.js";
import relationshipRoutes from "./routes/relationships.js";
import storiesRoutes from "./routes/stories.js";
import notificationRoutes from "./routes/notifications.js";
import featureRoutes from "./routes/features.js";
import messageRoutes from "./routes/messages.js";
import savedRoutes from "./routes/saved.js";
import multer from "multer";
import ImageKit from "imagekit";
const app = express();
const port = process.env.PORT || 8800;
const clientUrls = (process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

// Middleware order matters, so place CORS before route declarations.

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || clientUrls.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());



const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const allowedUploadTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedUploadTypes.includes(file.mimetype)) {
      cb(new Error("Only image and short video uploads are supported."));
      return;
    }
    cb(null, true);
  },
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json("No file uploaded.");
  try {
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: Date.now() + "_" + file.originalname,
      folder: "/uploads/posts",
    });
    res.status(200).json({
      filename: result.url,
      mediaType: file.mimetype.startsWith("video/") ? "video" : "image",
    });
  } catch (err) {
    console.error("ImageKit upload error:", err);
    res.status(500).json("File upload failed.");
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/saved", savedRoutes);


app.listen(port, () => {
  console.log(`Uks15 Social API is running on port ${port} ...`);
});
