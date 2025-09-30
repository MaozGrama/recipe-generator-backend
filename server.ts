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
  connectTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  maxPoolSize: 10,
  autoIndex: false,
  retryWrites: true,
  retryReads: true,
  bufferCommands: false
};

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/recipe-generator";
console.log(`[${new Date().toISOString()}] Connecting to MongoDB with URI: ${uri}`);

let isConnected = false;

const connectDb = async () => {
  try {
    await mongoose.connect(uri, mongooseOptions);
    isConnected = true;
    console.log(`[${new Date().toISOString()}] MongoDB connected`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] MongoDB connection error:`, err);
    throw err;
  }
};

app.use((req, res, next) => {
  if (!isConnected) {
    console.log(`[${new Date().toISOString()}] Rejecting request - MongoDB not connected`);
    return res.status(503).json({ error: "Database connection not established" });
  }
  next();
});

(async () => {
  await connectDb();
  app.use("/api/recipes", recipesRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/favorites", favoritesRouter);
  app.use("/api/ratings", ratingsRouter); // Changed from /api to /api/ratings
  app.use("/api/deals", dealsRouter);

  app.get("/api/test", (req, res) => res.json({ message: "Server is running" }));

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
})().catch(err => console.error("Server startup failed:", err));