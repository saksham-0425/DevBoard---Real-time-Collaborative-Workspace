import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import boardRoutes from './routes/board.routes.js';
import listRoutes from './routes/list.routes.js';
import cardRoutes from './routes/card.routes.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API is alive. Auth is coming. Brace yourself.');
});

export default app;
