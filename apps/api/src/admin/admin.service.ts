import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AdminStatsDto = {
  users: number;
  courses: number;
  enrollments: number;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<AdminStatsDto> {
    const [users, courses, enrollments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
    ]);
    return { users, courses, enrollments };
  }
}
