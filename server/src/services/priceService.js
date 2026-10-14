import { prisma } from '../config/prisma.js';
import { createNotification } from './notificationService.js';

export async function getPriceSuggestions({ categoryId, brand = null, condition = null }) {
  if (!categoryId) {
    return {
      suggestedRange: null,
      count: 0,
      message: 'Please select a category to view price insights.',
    };
  }

  const whereClause = {
    categoryId,
    status: { in: ['ACTIVE', 'SOLD'] },
  };

  if (brand && brand.trim()) {
    whereClause.brand = { contains: brand.trim(), mode: 'insensitive' };
  }

  if (condition) {
    whereClause.condition = condition;
  }

  const listings = await prisma.listing.findMany({
    where: whereClause,
    select: { price: true },
    orderBy: { price: 'asc' },
    take: 50,
  });

  const count = listings.length;

  if (count < 2) {
    // If brand was specified, try searching category alone for broad benchmark
    if (brand) {
      const categoryListings = await prisma.listing.findMany({
        where: { categoryId, status: { in: ['ACTIVE', 'SOLD'] } },
        select: { price: true },
        take: 30,
      });

      if (categoryListings.length >= 2) {
        const prices = categoryListings.map(l => l.price).sort((a, b) => a - b);
        const min = prices[0];
        const max = prices[prices.length - 1];
        const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

        return {
          suggestedRange: { min, max, average },
          count: categoryListings.length,
          explanation: `Insufficient specific data for '${brand}'. Showing category-wide price range based on ${categoryListings.length} comparable items.`,
        };
      }
    }

    return {
      suggestedRange: null,
      count,
      message: 'Insufficient market data for this specific model. You can set any fair asking price.',
    };
  }

  const prices = listings.map(l => l.price);
  const min = prices[0];
  const max = prices[prices.length - 1];
  const average = Math.round(prices.reduce((a, b) => a + b, 0) / count);

  return {
    suggestedRange: {
      min,
      max,
      average,
    },
    count,
    explanation: `Estimated based on ${count} active or recently sold comparable listings on ReLoop.`,
  };
}

export async function handlePriceChange(listingId, oldPrice, newPrice, listingTitle) {
  if (newPrice >= oldPrice) return;

  // Record price history
  await prisma.priceHistory.create({
    data: {
      listingId,
      oldPrice,
      newPrice,
    },
  });

  // Notify users who saved this listing
  const savedItems = await prisma.savedListing.findMany({
    where: { listingId },
    select: { userId: true },
  });

  if (savedItems.length > 0) {
    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    const title = `Price Drop: ${discount}% off on "${listingTitle}"!`;
    const message = `Price reduced from ₹${oldPrice.toLocaleString()} to ₹${newPrice.toLocaleString()}. Check it out now!`;
    const link = `/listing/${listingId}`;

    for (const item of savedItems) {
      await createNotification({
        userId: item.userId,
        type: 'PRICE_DROP',
        title,
        message,
        link,
      });
    }
  }
}
