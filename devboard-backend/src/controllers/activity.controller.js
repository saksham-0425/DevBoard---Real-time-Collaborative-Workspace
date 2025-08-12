import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Log a new activity
export const logActivity = async (action, { cardId, listId, boardId, userId }) => {
  try {
    return await prisma.activity.create({
      data: {
        action,
        cardId,
        listId,
        boardId,
        userId,
      },
    });
  } catch (err) {
    console.error("Log activity error:", err);
  }
};

// Get activities for a board
export const getBoardActivities = async (req, res) => {
  const { boardId } = req.params;

  try {
    const activities = await prisma.activity.findMany({
      where: { boardId },
      orderBy: { timestamp: 'desc' },
      include: {
        user: true,
        card: true,
        list: true
      }
    });

    res.json(activities);
  } catch (err) {
    console.error("Get board activities error:", err);
    res.status(500).json({ error: "Failed to fetch board activities" });
  }
};

// Get activities for a card
export const getCardActivities = async (req, res) => {
  const { cardId } = req.params;

  try {
    const activities = await prisma.activity.findMany({
      where: { cardId },
      orderBy: { timestamp: 'desc' },
      include: {
        user: true,
        list: true
      }
    });

    res.json(activities);
  } catch (err) {
    console.error("Get card activities error:", err);
    res.status(500).json({ error: "Failed to fetch card activities" });
  }
};
