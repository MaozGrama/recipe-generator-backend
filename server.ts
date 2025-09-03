import express from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes';

const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'https://recipegeneratorfrontend.vercel.app',
  process.env.VITE_FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    console.log('Request Origin:', origin); // Log for debugging
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.use('/api/recipes', recipesRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));