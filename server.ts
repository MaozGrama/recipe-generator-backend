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
  "http://localhost:5173"
];

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get("Origin")}`);
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    console.log(`[${new Date().toISOString()}] Checking origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`[${new Date().toISOString()}] Origin ${origin} allowed`);
      callback(null, true);
    } else {
      console.log(`[${new Date().toISOString()}] Origin ${origin} rejected`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 20000, // Increased to 20 seconds for Vercel
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  autoIndex: false,
  retryWrites: true,
  retryReads: true,
  bufferCommands: false,
  bufferMaxEntries: 0
};

// Log the URI being used (for debugging)
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/recipe-generator";
console.log(`[${new Date().toISOString()}] Connecting to MongoDB with URI: ${uri}`);

mongoose.connect(uri, mongooseOptions)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/recipes", recipesRouter);
app.use("/api/auth", authRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api", ratingsRouter);
app.use("/api/deals", dealsRouter);

app.get("/api/test", (req, res) => res.json({ message: "Server is running" }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));