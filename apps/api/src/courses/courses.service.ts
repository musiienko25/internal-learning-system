import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCatalog() {
    const courses = await this.prisma.course.findMany({
      orderBy: { title: 'asc' },
    });
    return {
      data: courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        durationHours: c.durationHours,
        isMandatory: c.isMandatory,
      })),
    };
  }
}
