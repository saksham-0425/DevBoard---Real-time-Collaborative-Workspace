// src/controllers/board.controller.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId; // JWT se aaya hua user ka ID

    if (!userId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    const board = await prisma.board.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: userId,
            role: 'admin', // Creator will be admin
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(201).json(board);
  } catch (err) {
    console.error("Create board error:", err);
    res.status(500).json({ error: "Failed to create board" });
  }
};
export const getMyBoards = async (req, res) => {
  const userId = req.user.id;

  try {
    const boards = await prisma.board.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
    });

    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get boards" });
  }
};

export const updateBoard = async (req, res) => {
  const { boardId } = req.params;
  const { name, description } = req.body;

  try {
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: { name, description },
    });

    res.json(updatedBoard);
  } catch (err) {
    console.error("Update board error:", err);
    res.status(500).json({ error: "Failed to update board" });
  }
};

export const deleteBoard = async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user.userId; // from authMiddleware

  try {
    // Find the membership record
    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete boards' });
    }

    // Proceed with deletion if admin
    await prisma.message.deleteMany({ where: { boardId } });
    await prisma.card.deleteMany({
      where: { list: { boardId } },
    });
    await prisma.list.deleteMany({ where: { boardId } });
    await prisma.boardMember.deleteMany({ where: { boardId } });
    await prisma.board.delete({ where: { id: boardId } });

    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    console.error('Delete board error:', err);
    res.status(500).json({ error: 'Failed to delete board' });
  }
};



export const getBoardDetails = async (req, res) => {
  const { boardId } = req.params;

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: true,
        lists: {
          include: {
            cards: true,
          },
        },
        messages: true,
      },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    res.json(board);
  } catch (err) {
    console.error("Get board details error:", err);
    res.status(500).json({ error: "Failed to fetch board details" });
  }
};
