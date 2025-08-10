import express from 'express';
import { createCard, getCardsByList, updateCard, deleteCard } from '../controllers/card.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, createCard);
router.get('/:listId', authMiddleware, getCardsByList); 
router.put('/:cardId', authMiddleware, updateCard);
router.delete('/:cardId', authMiddleware, deleteCard);


export default router;
