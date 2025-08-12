import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { logActivity } from './activity.controller.js'; 

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

      const list = await prisma.list.findUnique({ where: { id: listId } });

    await logActivity("Card created", {
      cardId: card.id,
      listId: listId,
      boardId: list.boardId,
      userId: req.user.id
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
      orderBy: { order: 'asc' },  // ordering by `order` field
      include: { assignedUsers: true }, // include assigned users info
    });

    res.json(cards);
  } catch (err) {
    console.error('Fetch cards error:', err);
    res.status(500).json({ error: 'Failed to get cards' });
  }
};

export const updateCard = async (req, res) => {
  const { cardId } = req.params;
  const { title, description, attachments, dueDate, status, listId, order } = req.body;

  try {
    const updateData = { title, description, attachments, status, order };
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (listId) updateData.list = { connect: { id: listId } };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: updateData,
      include: { assignedUsers: true },
    });

    // Get boardId
    const list = await prisma.list.findUnique({ where: { id: updatedCard.listId } });

    await logActivity("Card updated", {
      cardId: updatedCard.id,
      listId: updatedCard.listId,
      boardId: list.boardId,
      userId: req.user.id
    });

    res.json(updatedCard);
  } catch (err) {
    console.error('Update card error:', err);
    res.status(500).json({ error: 'Failed to update card' });
  }
};


export const deleteCard = async (req, res) => {
  const { cardId } = req.params;

  try {
    const deletedCard = await prisma.card.delete({
      where: { id: cardId },
    });

    const list = await prisma.list.findUnique({ where: { id: deletedCard.listId } });

    await logActivity("Card deleted", {
      cardId: deletedCard.id,
      listId: deletedCard.listId,
      boardId: list.boardId,
      userId: req.user.id
    });

    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Delete card error:', err);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};

// Assign member to card
export const assignMemberToCard = async (req, res) => {
  const { cardId } = req.params;
  const { userId } = req.body;

  try {
    const card = await prisma.card.update({
      where: { id: cardId },
      data: {
        assignedUsers: {
          connect: { id: userId },
        },
      },
      include: { assignedUsers: true },
    });

    res.json(card);
  } catch (err) {
    console.error('Assign member error:', err);
    res.status(500).json({ error: 'Failed to assign member' });
  }
};

// Unassign member from card
export const unassignMemberFromCard = async (req, res) => {
  const { cardId } = req.params;
  const { userId } = req.body;

  try {
    const card = await prisma.card.update({
      where: { id: cardId },
      data: {
        assignedUsers: {
          disconnect: { id: userId },
        },
      },
      include: { assignedUsers: true },
    });

    res.json(card);
  } catch (err) {
    console.error('Unassign member error:', err);
    res.status(500).json({ error: 'Failed to unassign member' });
  }
};

// Reorder cards within a list
export const reorderCards = async (req, res) => {
  const { listId } = req.params;
  const { orderedCards } = req.body; // expects [{ cardId, order }, ...]

  try {
    const updatePromises = orderedCards.map(({ cardId, order }) =>
      prisma.card.update({
        where: { id: cardId },
        data: { order },
      })
    );

    await logActivity(`Card moved to ${newList.name}`, {
  cardId,
  listId: newList.id,
  boardId: newList.boardId,
  userId: req.user.id
});


    await Promise.all(updatePromises);

    const cards = await prisma.card.findMany({
      where: { listId },
      orderBy: { order: 'asc' },
      include: { assignedUsers: true },
    });

    res.json(cards);
  } catch (err) {
    console.error('Reorder cards error:', err);
    res.status(500).json({ error: 'Failed to reorder cards' });
  }
};

export const getCardsByBoard = async (req, res) => {
  const { boardId } = req.params;

  try {
    const cards = await prisma.card.findMany({
      where: {
        list: {
          boardId: boardId,
        },
      },
      orderBy: { order: 'asc' },
      include: {
        assignedUsers: true,
        list: true,
      },
    });

    res.json(cards);
  } catch (err) {
    console.error('Fetch cards by board error:', err);
    res.status(500).json({ error: 'Failed to get cards for board' });
  }
};

export const moveCard = async (req, res) => {
  const { cardId } = req.params; // card to move
  const { newListId, newOrder } = req.body; // target list & new position

  try {
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) return res.status(404).json({ error: "Card not found" });

    const oldListId = card.listId;
    const oldOrder = card.order;

    await prisma.$transaction(async (tx) => {
      // STEP 1: Shift orders in old list if the list changed
      if (oldListId !== newListId) {
        // Close gap in old list
        await tx.card.updateMany({
          where: { listId: oldListId, order: { gt: oldOrder } },
          data: { order: { decrement: 1 } }
        });

        // Make space in new list
        await tx.card.updateMany({
          where: { listId: newListId, order: { gte: newOrder } },
          data: { order: { increment: 1 } }
        });
      } else {
        // Moving within the same list
        if (newOrder > oldOrder) {
          // Shift up cards between old and new position
          await tx.card.updateMany({
            where: {
              listId: oldListId,
              order: { gt: oldOrder, lte: newOrder }
            },
            data: { order: { decrement: 1 } }
          });
        } else if (newOrder < oldOrder) {
          // Shift down cards between new and old position
          await tx.card.updateMany({
            where: {
              listId: oldListId,
              order: { gte: newOrder, lt: oldOrder }
            },
            data: { order: { increment: 1 } }
          });
        }
      }

      // STEP 2: Move the card
      await tx.card.update({
        where: { id: cardId },
        data: {
          listId: newListId,
          order: newOrder
        }
      });
    });

    res.json({ message: "Card moved successfully" });
  } catch (err) {
    console.error("Move card error:", err);
    res.status(500).json({ error: "Failed to move card" });
  }
};