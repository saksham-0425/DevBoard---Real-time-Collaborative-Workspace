// src/routes/message.routes.js
import express from 'express';
import { sendMessage, getMessagesByBoard } from '../controllers/message.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, sendMessage);
router.get('/:boardId', authMiddleware, getMessagesByBoard);

export default router;
