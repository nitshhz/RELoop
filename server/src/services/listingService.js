import { prisma } from '../config/prisma.js';
import { calculateCompleteness } from '../validators/listingSchemas.js';
import { handlePriceChange } from './priceService.js';

export async function createListing(sellerId, data, images = []) {
  const completenessScore = calculateCompleteness(data, images.length);
  const status = data.isDraft ? 'DRAFT' : 'PENDING_REVIEW';

  const listing = await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      originalPrice: data.price,
      categoryId: data.categoryId,
      condition: data.condition || 'GOOD',
      brand: data.brand || null,
      model: data.model || null,
      specifications: data.specifications || null,
      location: data.location || null,
      status,
      completenessScore,
      sellerId,
      images: {
        create: images.map((img, idx) => ({
          url: img.url,
          publicId: img.publicId || null,
          order: idx,
        })),
      },
    },
    include: {
      images: true,
      category: true,
      seller: {
        select: { id: true, name: true, avatar: true, createdAt: true },
      },
    },
  });

  return listing;
}

export async function updateListing(userId, listingId, data, newImages = null, isAdmin = false) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: true },
  });

  if (!listing) {
    const error = new Error('Listing not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ownership authorization check
  if (!isAdmin && listing.sellerId !== userId) {
    const error = new Error('Unauthorized. You can only edit your own listings.');
    error.statusCode = 403;
    throw error;
  }

  const oldPrice = listing.price;
  const newPrice = data.price !== undefined ? data.price : oldPrice;

  const totalImageCount = newImages ? newImages.length : listing.images.length;
  const completenessScore = calculateCompleteness({ ...listing, ...data }, totalImageCount);

  // If price changed, trigger price drop detection
  if (newPrice < oldPrice) {
    await handlePriceChange(listingId, oldPrice, newPrice, listing.title);
  }

  const updatePayload = {
    ...data,
    completenessScore,
    updatedAt: new Date(),
  };

  if (newImages && newImages.length > 0) {
    // Replace or append images
    await prisma.listingImage.deleteMany({ where: { listingId } });
    updatePayload.images = {
      create: newImages.map((img, idx) => ({
        url: img.url,
        publicId: img.publicId || null,
        order: idx,
      })),
    };
  }

  return prisma.listing.update({
    where: { id: listingId },
    data: updatePayload,
    include: {
      images: true,
      category: true,
      seller: {
        select: { id: true, name: true, avatar: true, createdAt: true },
      },
    },
  });
}

export async function deleteListing(userId, listingId, isAdmin = false) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    const error = new Error('Listing not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ownership authorization check
  if (!isAdmin && listing.sellerId !== userId) {
    const error = new Error('Unauthorized. You can only delete your own listings.');
    error.statusCode = 403;
    throw error;
  }

  await prisma.listing.delete({
    where: { id: listingId },
  });

  return true;
}

export async function getPublicListings({
  page = 1,
  limit = 12,
  categoryId = null,
  condition = null,
  minPrice = null,
  maxPrice = null,
  search = null,
  sortBy = 'newest',
} = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  const whereClause = {
    status: 'ACTIVE', // Only public ACTIVE listings
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (condition) {
    whereClause.condition = condition;
  }

  if (minPrice !== null || maxPrice !== null) {
    whereClause.price = {};
    if (minPrice !== null && !isNaN(minPrice)) whereClause.price.gte = Number(minPrice);
    if (maxPrice !== null && !isNaN(maxPrice)) whereClause.price.lte = Number(maxPrice);
  }

  if (search && search.trim()) {
    const query = search.trim();
    whereClause.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { brand: { contains: query, mode: 'insensitive' } },
      { model: { contains: query, mode: 'insensitive' } },
    ];
  }

  let orderBy = { createdAt: 'desc' };
  if (sortBy === 'price_asc') orderBy = { price: 'asc' };
  if (sortBy === 'price_desc') orderBy = { price: 'desc' };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: whereClause,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: true,
        seller: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy,
      take: limit,
      skip,
    }),
    prisma.listing.count({ where: whereClause }),
  ]);

  return {
    listings,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
}

export async function getListingById(listingId, currentUserId = null, isAdmin = false) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      images: { orderBy: { order: 'asc' } },
      category: true,
      seller: {
        select: { id: true, name: true, avatar: true, bio: true, createdAt: true },
      },
      _count: {
        select: { savedBy: true, offers: true },
      },
    },
  });

  if (!listing) {
    const error = new Error('Listing not found.');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check for non-active listings
  if (listing.status !== 'ACTIVE') {
    const isOwner = currentUserId && listing.sellerId === currentUserId;
    if (!isOwner && !isAdmin) {
      const error = new Error('This listing is not currently available to the public.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Increment view count
  await prisma.listing.update({
    where: { id: listingId },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  // Record recently viewed for authenticated user
  if (currentUserId && currentUserId !== listing.sellerId) {
    await prisma.recentlyViewed.upsert({
      where: {
        userId_listingId: {
          userId: currentUserId,
          listingId,
        },
      },
      update: { viewedAt: new Date() },
      create: {
        userId: currentUserId,
        listingId,
      },
    }).catch(() => {});
  }

  return listing;
}

export async function getSimilarListings(listingId, categoryId, limit = 4) {
  return prisma.listing.findMany({
    where: {
      categoryId,
      id: { not: listingId },
      status: 'ACTIVE',
    },
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
      category: true,
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}
