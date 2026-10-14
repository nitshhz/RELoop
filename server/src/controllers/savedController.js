import { prisma } from '../config/prisma.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export async function toggleSaveListing(req, res, next) {
  try {
    const { listingId } = req.body;
    const userId = req.user.id;

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existing) {
      await prisma.savedListing.delete({
        where: { id: existing.id },
      });
      // Decrement saves count on listing
      await prisma.listing.update({
        where: { id: listingId },
        data: { savesCount: { decrement: 1 } },
      }).catch(() => {});

      return apiSuccess(res, { isSaved: false }, 'Listing removed from saved items.');
    } else {
      await prisma.savedListing.create({
        data: {
          userId,
          listingId,
        },
      });
      // Increment saves count on listing
      await prisma.listing.update({
        where: { id: listingId },
        data: { savesCount: { increment: 1 } },
      }).catch(() => {});

      return apiSuccess(res, { isSaved: true }, 'Listing saved successfully.');
    }
  } catch (err) {
    next(err);
  }
}

export async function getSavedListings(req, res, next) {
  try {
    const saved = await prisma.savedListing.findMany({
      where: { userId: req.user.id },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            category: true,
            seller: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const listings = saved.map(s => s.listing).filter(Boolean);
    return apiSuccess(res, { listings });
  } catch (err) {
    next(err);
  }
}

export async function getRecentlyViewed(req, res, next) {
  try {
    const recent = await prisma.recentlyViewed.findMany({
      where: { userId: req.user.id },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            category: true,
            seller: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: 12,
    });

    const listings = recent.map(r => r.listing).filter(Boolean);
    return apiSuccess(res, { listings });
  } catch (err) {
    next(err);
  }
}

export async function saveSearch(req, res, next) {
  try {
    const { name, query, filters } = req.body;
    const saved = await prisma.savedSearch.create({
      data: {
        userId: req.user.id,
        name: name || query || 'Saved Search',
        query: query || null,
        filters: filters || null,
      },
    });
    return apiSuccess(res, { savedSearch: saved }, 'Search query saved.', 201);
  } catch (err) {
    next(err);
  }
}

export async function getSavedSearches(req, res, next) {
  try {
    const searches = await prisma.savedSearch.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return apiSuccess(res, { searches });
  } catch (err) {
    next(err);
  }
}

export async function deleteSavedSearch(req, res, next) {
  try {
    const searchId = req.params.id;
    const item = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!item) {
      return apiError(res, 'Saved search not found.', 404);
    }

    if (item.userId !== req.user.id) {
      return apiError(res, 'Unauthorized.', 403);
    }

    await prisma.savedSearch.delete({
      where: { id: searchId },
    });

    return apiSuccess(res, null, 'Saved search deleted.');
  } catch (err) {
    next(err);
  }
}
