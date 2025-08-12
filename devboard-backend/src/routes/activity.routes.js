import express from 'express';
import { getBoardActivities, getCardActivities } from '../controllers/activity.controller.js';

const router = express.Router();

// Board-level activity logs
router.get('/board/:boardId', getBoardActivities);

// Card-level activity logs
router.get('/card/:cardId', getCardActivities);

export default router;
