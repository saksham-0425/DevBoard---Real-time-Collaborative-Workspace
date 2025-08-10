import app from './src/app.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // You can restrict this later to your frontend URL
    methods: ['GET', 'POST']
  }
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a board room
  socket.on('joinBoard', (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.id} joined board ${boardId}`);
  });

  // Handle sending message
  socket.on('sendMessage', async (data) => {
    const { content, boardId, senderId } = data;
    try {
      const message = await prisma.message.create({
        data: {
          content,
          board: { connect: { id: boardId } },
          sender: { connect: { id: senderId } }
        },
        include: { sender: true }
      });

      // Emit message to everyone in the board room
      io.to(boardId).emit('newMessage', message);
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
