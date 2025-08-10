import express from 'express';
import { createList, getListsByBoard } from '../controllers/list.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {updateList, deleteList } from '../controllers/list.controller.js';

const router = express.Router();

router.post('/', authMiddleware, createList); // POST /api/lists
router.get('/:boardId', authMiddleware, getListsByBoard); // GET /api/lists/:boardId
router.put('/:id', authMiddleware, updateList);
router.delete('/:id', authMiddleware, deleteList);

export default router;
