// src/controllers/list.controller.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createList = async (req, res) => {
  const { title, boardId } = req.body;

  try {
    const list = await prisma.list.create({
      data: {
        title,
        board: { connect: { id: boardId } },
      },
    });

    res.status(201).json(list);
  } catch (err) {
    console.error('Create list error:', err);
    res.status(500).json({ error: 'Failed to create list' });
  }
};

export const getListsByBoard = async (req, res) => {
  const { boardId } = req.params;

  try {
    const lists = await prisma.list.findMany({
      where: {
        boardId,
      },
      include: {
        cards: true, // ✅ fetch all cards inside each list
      },
      orderBy: {
        title: 'asc', // optional: keep lists sorted by title
      },
    });

    res.json(lists);
  } catch (err) {
    console.error('Fetch lists error:', err);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
};

// Update list title
export const updateList = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const updatedList = await prisma.list.update({
      where: { id },
      data: { title },
    });

    res.json(updatedList);
  } catch (err) {
    console.error('Update list error:', err);
    res.status(500).json({ error: 'Failed to update list' });
  }
};

// Delete list
export const deleteList = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.list.delete({
      where: { id },
    });

    res.json({ message: 'List deleted successfully' });
  } catch (err) {
    console.error('Delete list error:', err);
    res.status(500).json({ error: 'Failed to delete list' });
  }
};
