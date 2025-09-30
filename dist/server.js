"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const auth_1 = __importDefault(require("./routes/auth"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const ratings_1 = __importDefault(require("./routes/ratings"));
const deals_1 = __importDefault(require("./routes/deals"));
const app = (0, express_1.default)();
const allowedOrigins = [
    "https://recipegeneratorfrontend.vercel.app",
    "https://recipegeneratorfrontend-maozgrama-maozs-projects-54d44777.vercel.app",
    "http://localhost:5173"
];
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get("Origin")}`);
    next();
});
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log(`[${new Date().toISOString()}] Checking origin: ${origin}`);
        if (!origin || allowedOrigins.includes(origin)) {
            console.log(`[${new Date().toISOString()}] Origin ${origin} allowed`);
            callback(null, true);
        }
        else {
            console.log(`[${new Date().toISOString()}] Origin ${origin} rejected`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "OPTIONS", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.options("*", (0, cors_1.default)()); // Handle all OPTIONS requests
app.options("/api/auth/login", (0, cors_1.default)()); // Specific handler for login
app.options("/api/auth/signup", (0, cors_1.default)()); // Specific handler for signup
app.use(express_1.default.json());
mongoose_1.default.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/recipe-generator")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
app.use("/api/recipes", recipes_1.default);
app.use("/api/auth", auth_1.default);
app.use("/api/favorites", favorites_1.default);
app.use("/api", ratings_1.default);
app.use("/api/deals", deals_1.default);
app.get("/api/test", (req, res) => res.json({ message: "Server is running" }));
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
