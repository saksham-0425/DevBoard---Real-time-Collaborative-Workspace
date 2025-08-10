// src/controllers/message.controller.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const sendMessage = async (req, res) => {
  const { content, boardId } = req.body;
  const senderId = req.user.userId;

  try {
    const message = await prisma.message.create({
      data: {
        content,
        board: { connect: { id: boardId } },
        sender: { connect: { id: senderId } }
      },
      include: { sender: true }
    });

    // Broadcast via Socket.IO
    req.app.get('io').to(boardId).emit('newMessage', message);

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
