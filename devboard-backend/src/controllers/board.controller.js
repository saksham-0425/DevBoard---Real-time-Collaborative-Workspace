// src/controllers/board.controller.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const createBoard = async (req, res) => {
     console.log("REQ.USER in createBoard ===>", req.user);
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    console.log('User ID from token:', req.user);
    const board = await prisma.board.create({
  data: {
    name,
    description,
    members: {
      connect: {
        id: req.user.userId // ✅ correct key
      }
    }
  }
});

    res.status(201).json(board);
  } catch (err) {
    console.error('Create board error:', err);
    res.status(500).json({ error: 'Failed to create board' });
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
    res.status(500).json({ error: 'Failed to get boards' });
  }
};

// existing createBoard / getMyBoards ... (keep those)

export const getMembers = async (req, res) => {
  const { boardId } = req.params;

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { members: { select: { id: true, name: true, email: true, role: true } } },
    });

    if (!board) return res.status(404).json({ error: 'Board not found' });

    res.json({ members: board.members });
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

/**
 * Only board members or admin can add a member
 * Body: { email: "newuser@example.com" } OR { userId: "UUID" }
 */
export const addMember = async (req, res) => {
  const { boardId } = req.params;
  const { email, userId } = req.body;
  const requester = req.user; // your middleware sets req.user.userId, email, role

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    // Authorization: requester must be board member OR admin
    const isMember = board.members.some((m) => m.id === requester.userId);
    if (!isMember && requester.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: only members/admin can add users' });
    }

    // Find the user to add
    const userToAdd = email
      ? await prisma.user.findUnique({ where: { email } })
      : userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;

    if (!userToAdd) return res.status(404).json({ error: 'User to add not found' });

    // Already a member?
    const already = board.members.some((m) => m.id === userToAdd.id);
    if (already) return res.status(400).json({ error: 'User is already a member' });

    // Connect user to board (many-to-many)
    const updated = await prisma.board.update({
      where: { id: boardId },
      data: {
        members: {
          connect: { id: userToAdd.id },
        },
      },
      select: { id: true, name: true },
    });

    res.status(200).json({ message: 'Member added', board: updated, user: { id: userToAdd.id, email: userToAdd.email } });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

/**
 * Remove a member from board
 * Body: { userId: "UUID" } OR { email: "x@x.com" }
 * Only admin or board member can remove — if you want only admin to remove, change logic.
 */
export const removeMember = async (req, res) => {
  const { boardId } = req.params;
  const { email, userId } = req.body;
  const requester = req.user;

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const isMember = board.members.some((m) => m.id === requester.userId);
    if (!isMember && requester.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: only members/admin can remove users' });
    }

    const userToRemove = email
      ? await prisma.user.findUnique({ where: { email } })
      : userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;

    if (!userToRemove) return res.status(404).json({ error: 'User to remove not found' });

    // Prevent removing last member? (optional) — you can add checks here.

    const updated = await prisma.board.update({
      where: { id: boardId },
      data: {
        members: {
          disconnect: { id: userToRemove.id },
        },
      },
      select: { id: true, name: true },
    });

    res.status(200).json({ message: 'Member removed', board: updated, user: { id: userToRemove.id, email: userToRemove.email } });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
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
    console.error('Update board error:', err);
    res.status(500).json({ error: 'Failed to update board' });
  }
};

export const deleteBoard = async (req, res) => {
  const { boardId } = req.params;

  try {
    await prisma.board.delete({
      where: { id: boardId },
    });

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
            cards: true
          }
        },
        messages: true
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (err) {
    console.error('Get board details error:', err);
    res.status(500).json({ error: 'Failed to fetch board details' });
  }
};
