import { prisma } from '../config/prisma.js';
import { createNotification } from './notificationService.js';

export async function getOrCreateConversation({ userId, listingId }) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, title: true },
  });

  if (!listing) {
    const error = new Error('Listing not found.');
    error.statusCode = 404;
    throw error;
  }

  if (listing.sellerId === userId) {
    const error = new Error('You cannot start a conversation with yourself.');
    error.statusCode = 400;
    throw error;
  }

  // Find existing conversation between this buyer and seller on this listing
  let conversation = await prisma.conversation.findUnique({
    where: {
      listingId_buyerId_sellerId: {
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
      },
    },
    include: {
      listing: {
        select: { id: true, title: true, price: true, status: true, images: { take: 1 } },
      },
      buyer: { select: { id: true, name: true, avatar: true } },
      seller: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
      },
      include: {
        listing: {
          select: { id: true, title: true, price: true, status: true, images: { take: 1 } },
        },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        messages: true,
      },
    });
  }

  return conversation;
}

export async function getUserConversations(userId) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      listing: {
        select: { id: true, title: true, price: true, status: true, images: { take: 1 } },
      },
      buyer: { select: { id: true, name: true, avatar: true } },
      seller: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: userId },
              isRead: false,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations.map(c => ({
    ...c,
    unreadCount: c._count.messages,
  }));
}

export async function getConversationMessages(userId, conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: {
        select: { id: true, title: true, price: true, status: true, images: { take: 1 } },
      },
      buyer: { select: { id: true, name: true, avatar: true } },
      seller: { select: { id: true, name: true, avatar: true } },
    },
  });

  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check (Test 9: Cannot read another user's private conversations)
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    const error = new Error('Unauthorized. You are not a participant in this conversation.');
    error.statusCode = 403;
    throw error;
  }

  // Mark all unread messages from other user as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  return { conversation, messages };
}

export async function sendMessage({ userId, conversationId, content = '', imageUrl = null, isQuickReply = false }) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: { select: { id: true, title: true } },
    },
  });

  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.statusCode = 404;
    throw error;
  }

  // Participant authorization
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    const error = new Error('Unauthorized. You cannot send messages to this conversation.');
    error.statusCode = 403;
    throw error;
  }

  if (conversation.isBlocked) {
    const error = new Error('This conversation has been blocked.');
    error.statusCode = 403;
    throw error;
  }

  const cleanContent = typeof content === 'string' ? content.trim() : '';
  if (!cleanContent && !imageUrl) {
    const error = new Error('Message text or an image attachment is required.');
    error.statusCode = 400;
    throw error;
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content: cleanContent,
      imageUrl: imageUrl || null,
      isQuickReply: Boolean(isQuickReply),
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Send notification to recipient
  const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
  const previewText = cleanContent
    ? (cleanContent.length > 60 ? `${cleanContent.slice(0, 57)}...` : cleanContent)
    : '📷 [Image Attachment]';

  await createNotification({
    userId: recipientId,
    type: 'NEW_MESSAGE',
    title: `New message on "${conversation.listing.title}"`,
    message: previewText,
    link: `/messages/${conversationId}`,
  });

  return message;
}

export async function toggleBlockConversation(userId, conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    const error = new Error('Unauthorized.');
    error.statusCode = 403;
    throw error;
  }

  const isBlocked = !conversation.isBlocked;
  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      isBlocked,
      blockedById: isBlocked ? userId : null,
    },
  });
}
