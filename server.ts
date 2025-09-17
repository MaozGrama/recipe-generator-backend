import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import recipesRouter from "./routes/recipes";
import authRouter from "./routes/auth";
import favoritesRouter from "./routes/favorites";
import ratingsRouter from "./routes/ratings";
import dealsRouter from "./routes/deals";

const app = express();

const allowedOrigins = [
  "https://recipegeneratorfrontend.vercel.app",
  "https://recipegeneratorfrontend-maozgrama-maozs-projects-54d44777.vercel.app",
  "http://localhost:5173" // For local development
];

app.use(cors({
  origin: (origin, callback) => {
    console.log("Request Origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/recipe-generator")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/recipes", recipesRouter);
app.use("/api/auth", authRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api", ratingsRouter); // Note: This mounts ratings at /api, which might overlap
app.use("/api/deals", dealsRouter);

// Test route
app.get("/api/test", (req, res) => res.json({ message: "Server is running" }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));