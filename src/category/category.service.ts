import { prisma } from '../common/config/prisma';
import { AppError } from '../common/middleware/errorHandler';
import { CreateCategoryInput, UpdateCategoryInput } from './category.schema';

export class CategoryService {
  async create(data: CreateCategoryInput) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError('Category already exists', 409);
    }

    return prisma.category.create({ data });
  }

  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    });
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  async update(id: string, data: UpdateCategoryInput) {
    await this.findById(id);

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryService = new CategoryService();
