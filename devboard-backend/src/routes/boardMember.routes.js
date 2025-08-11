// src/routes/boardMember.routes.js
import express from 'express';
import {
  getMembers,
  addMember,
  removeMember,
  changeMemberRole,
} from '../controllers/boardMember.controller.js';
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/:boardId/members', authMiddleware, getMembers);
router.post('/:boardId/members', authMiddleware, addMember);
router.delete('/:boardId/members/:userId', authMiddleware, removeMember);
router.put('/:boardId/members/:userId/role', authMiddleware, changeMemberRole);

export default router;
