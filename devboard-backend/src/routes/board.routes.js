import express from "express";
import {
  createBoard,
  getMyBoards,
  getMembers,
  addMember,
  removeMember,
} from "../controllers/board.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  updateBoard,
  deleteBoard,
  getBoardDetails,
} from "../controllers/board.controller.js";


const router = express.Router();

router.post("/", authMiddleware, createBoard);
router.get("/", authMiddleware, getMyBoards);

// Member management
router.get("/:boardId/members", authMiddleware, getMembers); // GET members
router.post("/:boardId/members", authMiddleware, addMember); // POST add member (body: email OR userId)
router.delete("/:boardId/members", authMiddleware, removeMember); // DELETE remove member (body: email OR userId)

router.put("/:boardId", authMiddleware, updateBoard);
router.delete("/:boardId", authMiddleware, deleteBoard);
router.get("/:boardId/details", authMiddleware, getBoardDetails);

export default router;
