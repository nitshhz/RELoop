import { prisma } from '../config/prisma.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export async function getAllCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            listings: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: c.description,
      listingsCount: c._count.listings,
    }));

    return apiSuccess(res, { categories: formatted });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!category) {
      return apiError(res, 'Category not found.', 404);
    }

    return apiSuccess(res, { category });
  } catch (err) {
    next(err);
  }
}
