import { prisma } from '../config/prisma.js';

export async function createNotification({ userId, type, title, message, link = null }) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  } catch (err) {
    console.error('[Notification Error]', err);
    return null;
  }
}

export async function getUserNotifications(userId, { limit = 20, offset = 0 } = {}) {
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({
      where: { userId },
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return { notifications, total, unreadCount };
}

export async function markNotificationAsRead(userId, notificationId) {
  // Enforce ownership check
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    const error = new Error('Notification not found or unauthorized.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
