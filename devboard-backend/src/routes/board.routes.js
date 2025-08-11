import express from "express";
import {
  createBoard,
  getMyBoards,
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

router.put("/:boardId", authMiddleware, updateBoard);
router.delete("/:boardId", authMiddleware, deleteBoard);
router.get("/:boardId/details", authMiddleware, getBoardDetails);

export default router;
