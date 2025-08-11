// src/controllers/boardMember.controller.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get all members of a board
 */
export const getMembers = async (req, res) => {
  const { boardId } = req.params;

  try {
    const members = await prisma.boardMember.findMany({
      where: { boardId },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(members);
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

/**
 * Add a member to the board
 */
export const addMember = async (req, res) => {
  const { boardId } = req.params;
  const { email, userId } = req.body;
  const role = 'member';

  try {
    const user = email
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent duplicates
    const exists = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId, userId: user.id },
      },
    });
    if (exists) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const member = await prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
        role,
      },
      include: { user: true },
    });

    res.status(201).json(member);
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

/**
 * Remove a member from the board
 */
export const removeMember = async (req, res) => {
  const { boardId, userId } = req.params;

  try {
    await prisma.boardMember.delete({
      where: { boardId_userId: { boardId, userId } },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

/**
 * Change a member's role
 */
export const changeMemberRole = async (req, res) => {
  const { boardId, userId } = req.params;
  const { role } = req.body;

  try {
    const updatedMember = await prisma.boardMember.update({
      where: { boardId_userId: { boardId, userId } },
      data: { role },
      include: { user: true },
    });

    res.json(updatedMember);
  } catch (err) {
    console.error('Change member role error:', err);
    res.status(500).json({ error: 'Failed to change member role' });
  }
};
