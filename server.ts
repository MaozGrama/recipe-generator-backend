import express from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes';

const app = express();
app.use(cors({
  origin: process.env.VITE_FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());

app.use('/api/recipes', recipesRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));