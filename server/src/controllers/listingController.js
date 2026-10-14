import * as listingService from '../services/listingService.js';
import { processUploadedFile } from '../middleware/upload.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { prisma } from '../config/prisma.js';

export async function createListing(req, res, next) {
  try {
    let images = [];

    // Process files uploaded via multipart form
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const processed = await processUploadedFile(file, req);
        images.push(processed);
      }
    } else if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
      // Support pre-uploaded / image URLs
      images = req.body.imageUrls.map(url => ({ url }));
    }

    // Parse specifications if stringified in multipart form data
    let specs = req.body.specifications;
    if (typeof specs === 'string') {
      try {
        specs = JSON.parse(specs);
      } catch {
        specs = null;
      }
    }

    const listingData = {
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      categoryId: req.body.categoryId,
      condition: req.body.condition || 'GOOD',
      brand: req.body.brand || null,
      model: req.body.model || null,
      specifications: specs,
      location: req.body.location || null,
      isDraft: req.body.isDraft === true || req.body.isDraft === 'true',
    };

    const listing = await listingService.createListing(req.user.id, listingData, images);

    return apiSuccess(
      res,
      { listing },
      listingData.isDraft ? 'Draft saved successfully.' : 'Listing submitted for review.',
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function updateListing(req, res, next) {
  try {
    const listingId = req.params.id;
    let newImages = null;

    if (req.files && req.files.length > 0) {
      newImages = [];
      for (const file of req.files) {
        const processed = await processUploadedFile(file, req);
        newImages.push(processed);
      }
    } else if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
      newImages = req.body.imageUrls.map(url => ({ url }));
    }

    let specs = req.body.specifications;
    if (typeof specs === 'string') {
      try {
        specs = JSON.parse(specs);
      } catch {
        specs = null;
      }
    }

    const updateData = {
      ...(req.body.title && { title: req.body.title }),
      ...(req.body.description && { description: req.body.description }),
      ...(req.body.price !== undefined && { price: Number(req.body.price) }),
      ...(req.body.categoryId && { categoryId: req.body.categoryId }),
      ...(req.body.condition && { condition: req.body.condition }),
      ...(req.body.brand !== undefined && { brand: req.body.brand }),
      ...(req.body.model !== undefined && { model: req.body.model }),
      ...(specs !== undefined && { specifications: specs }),
      ...(req.body.location !== undefined && { location: req.body.location }),
    };

    const isAdmin = req.user.role === 'ADMIN';
    const updated = await listingService.updateListing(req.user.id, listingId, updateData, newImages, isAdmin);

    return apiSuccess(res, { listing: updated }, 'Listing updated successfully.');
  } catch (err) {
    next(err);
  }
}

export async function deleteListing(req, res, next) {
  try {
    const listingId = req.params.id;
    const isAdmin = req.user.role === 'ADMIN';
    await listingService.deleteListing(req.user.id, listingId, isAdmin);
    return apiSuccess(res, null, 'Listing deleted successfully.');
  } catch (err) {
    next(err);
  }
}

export async function getPublicListings(req, res, next) {
  try {
    const { page, limit, categoryId, condition, minPrice, maxPrice, search, sortBy } = req.query;
    const result = await listingService.getPublicListings({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      categoryId,
      condition,
      minPrice,
      maxPrice,
      search,
      sortBy,
    });
    return apiSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getListingById(req, res, next) {
  try {
    const listingId = req.params.id;
    const currentUserId = req.user?.id || null;
    const isAdmin = req.user?.role === 'ADMIN';

    const listing = await listingService.getListingById(listingId, currentUserId, isAdmin);
    const similar = await listingService.getSimilarListings(listingId, listing.categoryId, 4);

    let isSaved = false;
    if (currentUserId) {
      const saved = await prisma.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId: currentUserId,
            listingId,
          },
        },
      });
      isSaved = Boolean(saved);
    }

    return apiSuccess(res, { listing, similar, isSaved });
  } catch (err) {
    next(err);
  }
}

export async function getMyListings(req, res, next) {
  try {
    const { status } = req.query;
    const whereClause = { sellerId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: true,
        _count: { select: { savedBy: true, offers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(res, { listings });
  } catch (err) {
    next(err);
  }
}

export async function changeListingStatus(req, res, next) {
  try {
    const listingId = req.params.id;
    const { status } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return apiError(res, 'Listing not found.', 404);
    }

    if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return apiError(res, 'Unauthorized to change listing status.', 403);
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: { status },
    });

    return apiSuccess(res, { listing: updated }, `Listing status updated to ${status}.`);
  } catch (err) {
    next(err);
  }
}
