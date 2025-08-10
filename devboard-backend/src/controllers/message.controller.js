// src/controllers/message.controller.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const sendMessage = async (req, res) => {
  const { content, boardId } = req.body;
  const senderId = req.user.userId; // from JWT

  try {
    // Check if user is a member of the board
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true }
    });

    if (!board) return res.status(404).json({ error: 'Board not found' });
    if (!board.members.some(member => member.id === senderId)) {
      return res.status(403).json({ error: 'You are not a member of this board' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        board: { connect: { id: boardId } },
        sender: { connect: { id: senderId } }
      },
      include: { sender: true }
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getMessagesByBoard = async (req, res) => {
  const { boardId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { boardId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
