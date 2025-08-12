import express from 'express';

import {
  createCard,
  getCardsByList,
  updateCard,
  deleteCard,
  assignMemberToCard,
  unassignMemberFromCard,
  reorderCards,
  moveCard
} from '../controllers/card.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getCardsByBoard } from '../controllers/card.controller.js';


const router = express.Router();

router.post('/', authMiddleware, createCard);
router.get('/:listId', authMiddleware, getCardsByList);
router.put('/:cardId', authMiddleware, updateCard);
router.delete('/:cardId', authMiddleware, deleteCard);
router.patch("/:cardId/move", moveCard);

router.get('/board/:boardId', authMiddleware, getCardsByBoard);  

// Assign/unassign users
router.post('/:cardId/assign', authMiddleware, assignMemberToCard);
router.post('/:cardId/unassign', authMiddleware, unassignMemberFromCard);

// Reorder cards
router.put('/reorder/:listId', authMiddleware, reorderCards);



export default router;
