import { prisma } from '../config/prisma.js';
import { createNotification } from './notificationService.js';

export async function createOffer({ buyerId, listingId, amount }) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, price: true, status: true, sellerId: true },
  });

  if (!listing) {
    const error = new Error('Listing not found.');
    error.statusCode = 404;
    throw error;
  }

  // Enforce business rules
  if (listing.status !== 'ACTIVE') {
    const error = new Error('Offers can only be submitted for active listings.');
    error.statusCode = 400;
    throw error;
  }

  // Rule: Cannot offer on own listing (Test 5)
  if (listing.sellerId === buyerId) {
    const error = new Error('You cannot make an offer on your own listing.');
    error.statusCode = 400;
    throw error;
  }

  // Rule: Positive valid price (Test 6)
  if (!amount || amount <= 0) {
    const error = new Error('Invalid offer amount. Must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  const offer = await prisma.offer.create({
    data: {
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      amount: Number(amount),
      status: 'PENDING',
    },
    include: {
      listing: { select: { id: true, title: true } },
      buyer: { select: { id: true, name: true } },
    },
  });

  // Notify seller
  await createNotification({
    userId: listing.sellerId,
    type: 'OFFER_RECEIVED',
    title: `New Offer on "${listing.title}"`,
    message: `${offer.buyer.name} offered ₹${Number(amount).toLocaleString()} for your listing.`,
    link: `/offers`,
  });

  return offer;
}

export async function respondToOffer({ userId, offerId, action, counterAmount = null }) {
  // Fetch offer with listing
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      listing: true,
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
    },
  });

  if (!offer) {
    const error = new Error('Offer not found.');
    error.statusCode = 404;
    throw error;
  }

  // Authorization and validity check
  const isSeller = offer.sellerId === userId;
  const isBuyer = offer.buyerId === userId;

  if (!isSeller && !isBuyer) {
    const error = new Error('Unauthorized to respond to this offer.');
    error.statusCode = 403;
    throw error;
  }

  // Rule: Offers cannot be accepted after becoming invalid or expired (Test 7)
  if (offer.status !== 'PENDING' && offer.status !== 'COUNTERED') {
    const error = new Error(`Cannot respond to offer with status ${offer.status}.`);
    error.statusCode = 400;
    throw error;
  }

  if (offer.expiresAt && new Date() > offer.expiresAt) {
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'EXPIRED' },
    });
    const error = new Error('This offer has expired.');
    error.statusCode = 400;
    throw error;
  }

  if (action === 'ACCEPT') {
    // If status is COUNTERED, the buyer is the one accepting the counteroffer!
    if (offer.status === 'COUNTERED' && !isBuyer) {
      const error = new Error('Only the buyer can accept a counteroffer.');
      error.statusCode = 403;
      throw error;
    }
    // If status is PENDING, only the seller can accept!
    if (offer.status === 'PENDING' && !isSeller) {
      const error = new Error('Only the seller can accept a pending offer.');
      error.statusCode = 403;
      throw error;
    }

    // Atomic transaction: verify listing is still active, update status, and close concurrent offers
    return prisma.$transaction(async (tx) => {
      // Re-fetch listing with lock/check (Test 8: Concurrent offer acceptance guard)
      const currentListing = await tx.listing.findUnique({
        where: { id: offer.listingId },
      });

      if (currentListing.status !== 'ACTIVE') {
        const err = new Error('Listing is no longer active. Another offer may have already been accepted.');
        err.statusCode = 409;
        throw err;
      }

      // Mark listing as RESERVED
      await tx.listing.update({
        where: { id: offer.listingId },
        data: { status: 'RESERVED' },
      });

      // Mark this offer as ACCEPTED
      const updatedOffer = await tx.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' },
      });

      // Reject all other pending/countered offers for this listing
      await tx.offer.updateMany({
        where: {
          listingId: offer.listingId,
          id: { not: offerId },
          status: { in: ['PENDING', 'COUNTERED'] },
        },
        data: { status: 'REJECTED' },
      });

      // Notify the other party
      const notifyTarget = isSeller ? offer.buyerId : offer.sellerId;
      const acceptedPrice = offer.status === 'COUNTERED' && offer.counterAmount ? offer.counterAmount : offer.amount;
      await createNotification({
        userId: notifyTarget,
        type: 'OFFER_ACCEPTED',
        title: `Offer Accepted for "${offer.listing.title}"!`,
        message: `Your deal for ₹${acceptedPrice.toLocaleString()} has been agreed upon!`,
        link: `/offers`,
      });

      return updatedOffer;
    });
  }

  if (action === 'REJECT') {
    if (!isSeller) {
      const error = new Error('Only the seller can reject this offer.');
      error.statusCode = 403;
      throw error;
    }

    const updated = await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'REJECTED' },
    });

    await createNotification({
      userId: offer.buyerId,
      type: 'OFFER_REJECTED',
      title: `Offer Declined for "${offer.listing.title}"`,
      message: `The seller did not accept your offer of ₹${offer.amount.toLocaleString()}.`,
      link: `/offers`,
    });

    return updated;
  }

  if (action === 'COUNTER') {
    if (!isSeller) {
      const error = new Error('Only the seller can make a counter-offer.');
      error.statusCode = 403;
      throw error;
    }

    if (!counterAmount || counterAmount <= 0) {
      const error = new Error('A valid counter-offer amount greater than zero is required.');
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: 'COUNTERED',
        counterAmount: Number(counterAmount),
      },
    });

    await createNotification({
      userId: offer.buyerId,
      type: 'OFFER_COUNTERED',
      title: `Counter-Offer on "${offer.listing.title}"`,
      message: `The seller countered with ₹${Number(counterAmount).toLocaleString()}.`,
      link: `/offers`,
    });

    return updated;
  }

  const error = new Error('Invalid action.');
  error.statusCode = 400;
  throw error;
}

export async function withdrawOffer({ buyerId, offerId }) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    const error = new Error('Offer not found.');
    error.statusCode = 404;
    throw error;
  }

  if (offer.buyerId !== buyerId) {
    const error = new Error('Unauthorized. You can only withdraw your own offers.');
    error.statusCode = 403;
    throw error;
  }

  if (offer.status !== 'PENDING' && offer.status !== 'COUNTERED') {
    const error = new Error(`Cannot withdraw an offer with status ${offer.status}.`);
    error.statusCode = 400;
    throw error;
  }

  return prisma.offer.update({
    where: { id: offerId },
    data: { status: 'WITHDRAWN' },
  });
}

export async function getUserOffers(userId) {
  const [sentOffers, receivedOffers] = await Promise.all([
    prisma.offer.findMany({
      where: { buyerId: userId },
      include: {
        listing: {
          select: { id: true, title: true, price: true, status: true, images: { take: 1 } },
        },
        seller: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.offer.findMany({
      where: { sellerId: userId },
      include: {
        listing: {
          select: { id: true, title: true, price: true, status: true, images: { take: 1 } },
        },
        buyer: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { sentOffers, receivedOffers };
}
