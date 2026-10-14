import { prisma } from '../config/prisma.js';

export async function getSellerAnalytics(sellerId) {
  const [
    activeCount,
    draftCount,
    pendingCount,
    reservedCount,
    soldCount,
    listings,
    incomingOffersCount,
    pendingOffersCount,
    conversations,
  ] = await Promise.all([
    prisma.listing.count({ where: { sellerId, status: 'ACTIVE' } }),
    prisma.listing.count({ where: { sellerId, status: 'DRAFT' } }),
    prisma.listing.count({ where: { sellerId, status: 'PENDING_REVIEW' } }),
    prisma.listing.count({ where: { sellerId, status: 'RESERVED' } }),
    prisma.listing.count({ where: { sellerId, status: 'SOLD' } }),
    prisma.listing.findMany({
      where: { sellerId },
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        viewsCount: true,
        completenessScore: true,
        createdAt: true,
        _count: { select: { savedBy: true, offers: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.offer.count({ where: { sellerId } }),
    prisma.offer.count({ where: { sellerId, status: 'PENDING' } }),
    prisma.conversation.findMany({
      where: { sellerId },
      include: {
        _count: {
          select: {
            messages: { where: { senderId: { not: sellerId }, isRead: false } },
          },
        },
      },
    }),
  ]);

  const totalViews = listings.reduce((sum, item) => sum + (item.viewsCount || 0), 0);
  const totalSaves = listings.reduce((sum, item) => sum + (item._count.savedBy || 0), 0);
  const unreadMessagesCount = conversations.reduce((sum, c) => sum + (c._count.messages || 0), 0);

  // Identify listings that could benefit from completeness improvements
  const incompleteListings = listings
    .filter(l => l.completenessScore < 80 && ['ACTIVE', 'PENDING_REVIEW', 'DRAFT'].includes(l.status))
    .map(l => ({
      id: l.id,
      title: l.title,
      score: l.completenessScore,
      suggestion:
        l.score < 50
          ? 'Add photos and more detailed description'
          : 'Add specific brand, model, and item specs',
    }));

  return {
    summary: {
      activeListings: activeCount,
      draftListings: draftCount,
      pendingListings: pendingCount,
      reservedListings: reservedCount,
      soldListings: soldCount,
      totalListings: listings.length,
      totalViews,
      totalSaves,
      incomingOffers: incomingOffersCount,
      pendingOffers: pendingOffersCount,
      unreadMessages: unreadMessagesCount,
    },
    recentListings: listings.slice(0, 5),
    incompleteListings,
  };
}
