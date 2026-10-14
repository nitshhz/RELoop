import { prisma } from '../config/prisma.js';
import { logAdminAction } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalUsers,
      activeListings,
      pendingListings,
      soldListings,
      openReports,
      totalOffers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.listing.count({ where: { status: 'SOLD' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.offer.count(),
    ]);

    return apiSuccess(res, {
      stats: {
        totalUsers,
        activeListings,
        pendingListings,
        soldListings,
        openReports,
        totalOffers,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPendingListings(req, res, next) {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        category: true,
        seller: { select: { id: true, name: true, email: true, createdAt: true } },
        images: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return apiSuccess(res, { listings });
  } catch (err) {
    next(err);
  }
}

export async function moderateListing(req, res, next) {
  try {
    const listingId = req.params.id;
    const { action, reason } = req.body; // action: APPROVE, REJECT, REMOVE, RESTORE

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      return apiError(res, 'Listing not found.', 404);
    }

    let newStatus = listing.status;
    let notifTitle = '';
    let notifMessage = '';

    if (action === 'APPROVE') {
      newStatus = 'ACTIVE';
      notifTitle = `Listing Approved: "${listing.title}"`;
      notifMessage = 'Your product listing has passed moderation and is now publicly live on ReLoop!';
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      notifTitle = `Listing Rejected: "${listing.title}"`;
      notifMessage = `Your listing was not approved. Reason: ${reason || 'Does not adhere to marketplace guidelines'}.`;
    } else if (action === 'REMOVE') {
      newStatus = 'REMOVED';
      notifTitle = `Listing Removed: "${listing.title}"`;
      notifMessage = `Your listing has been removed for violating marketplace policies: ${reason || 'Policy violation'}.`;
    } else if (action === 'RESTORE') {
      newStatus = 'ACTIVE';
      notifTitle = `Listing Restored: "${listing.title}"`;
      notifMessage = 'Your previously removed listing has been restored to active status.';
    } else {
      return apiError(res, 'Invalid moderation action.', 400);
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: newStatus,
        moderationReason: reason || null,
      },
    });

    // Record audit log (Test 16)
    await logAdminAction({
      adminId: req.user.id,
      action: `LISTING_${action}`,
      targetType: 'LISTING',
      targetId: listingId,
      reason,
      metadata: { previousStatus: listing.status, newStatus },
    });

    // Notify seller
    await createNotification({
      userId: listing.sellerId,
      type: action === 'APPROVE' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      title: notifTitle,
      message: notifMessage,
      link: `/listing/${listingId}`,
    });

    return apiSuccess(res, { listing: updated }, `Listing moderation action ${action} executed.`);
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const whereClause = {};
    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    if (role) {
      whereClause.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isSuspended: true,
          suspensionReason: true,
          createdAt: true,
          _count: { select: { listings: true, reportsSubmitted: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit, 10),
        skip,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return apiSuccess(res, {
      users,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserSuspension(req, res, next) {
  try {
    const userId = req.params.id;
    const { isSuspended, reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return apiError(res, 'User not found.', 404);
    }

    if (user.role === 'ADMIN') {
      return apiError(res, 'Cannot suspend an administrator account.', 400);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: Boolean(isSuspended),
        suspensionReason: isSuspended ? reason || 'Terms of service violation' : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isSuspended: true,
        suspensionReason: true,
      },
    });

    // Record audit log (Test 16)
    await logAdminAction({
      adminId: req.user.id,
      action: isSuspended ? 'USER_SUSPEND' : 'USER_REACTIVATE',
      targetType: 'USER',
      targetId: userId,
      reason,
    });

    return apiSuccess(
      res,
      { user: updated },
      isSuspended ? 'User account suspended.' : 'User account reactivated.'
    );
  } catch (err) {
    next(err);
  }
}

export async function getReports(req, res, next) {
  try {
    const { status } = req.query;
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(res, { reports });
  } catch (err) {
    next(err);
  }
}

export async function resolveReport(req, res, next) {
  try {
    const reportId = req.params.id;
    const { status, resolutionNotes } = req.body; // RESOLVED, DISMISSED

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return apiError(res, 'Report not found.', 404);
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        resolutionNotes,
        resolvedById: req.user.id,
      },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: `REPORT_${status}`,
      targetType: 'REPORT',
      targetId: reportId,
      reason: resolutionNotes,
    });

    return apiSuccess(res, { report: updated }, `Report marked as ${status}.`);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, slug, icon, description } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        icon: icon || null,
        description: description || null,
      },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: 'CATEGORY_CREATE',
      targetType: 'CATEGORY',
      targetId: category.id,
      reason: `Created category ${name}`,
    });

    return apiSuccess(res, { category }, 'Category created.', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const categoryId = req.params.id;
    const { name, slug, icon, description, isActive } = req.body;

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: 'CATEGORY_UPDATE',
      targetType: 'CATEGORY',
      targetId: categoryId,
    });

    return apiSuccess(res, { category: updated }, 'Category updated.');
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit, 10),
        skip,
      }),
      prisma.auditLog.count(),
    ]);

    return apiSuccess(res, {
      logs,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err) {
    next(err);
  }
}
