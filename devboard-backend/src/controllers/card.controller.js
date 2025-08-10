import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createCard = async (req, res) => {
  const { title, description, listId, dueDate, attachments } = req.body;

  try {
    const card = await prisma.card.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        attachments: attachments || [],
        list: { connect: { id: listId } },
      },
    });

    res.status(201).json(card);
  } catch (err) {
    console.error('Create card error:', err);
    res.status(500).json({ error: 'Failed to create card' });
  }
};

export const getCardsByList = async (req, res) => {
  const { listId } = req.params;

  try {
    const cards = await prisma.card.findMany({
      where: { listId },
    });

    res.json(cards);
  } catch (err) {
    console.error('Fetch cards error:', err);
    res.status(500).json({ error: 'Failed to get cards' });
  }
};

export const updateCard = async (req, res) => {
  const { cardId } = req.params;
  const { title, description, attachments, dueDate } = req.body;

  try {
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        title,
        description,
        attachments,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    res.json(updatedCard);
  } catch (err) {
    console.error('Update card error:', err);
    res.status(500).json({ error: 'Failed to update card' });
  }
};

// Delete a card
export const deleteCard = async (req, res) => {
  const { cardId } = req.params;

  try {
    await prisma.card.delete({
      where: { id: cardId },
    });

    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Delete card error:', err);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};