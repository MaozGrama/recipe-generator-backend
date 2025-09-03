"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:3000',
    'https://recipegeneratorfrontend.vercel.app',
    process.env.VITE_FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log('Request Origin:', origin); // Log for debugging
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express_1.default.json());
app.use('/api/recipes', recipes_1.default);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
