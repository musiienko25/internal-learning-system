import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException();
    }
    try {
      const enrollment = await this.prisma.enrollment.create({
        data: { userId, courseId },
      });
      return {
        message: 'Successfully enrolled',
        enrolledAt: enrollment.enrolledAt.toISOString(),
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Already enrolled in this course');
      }
      throw e;
    }
  }

  async listForUser(userId: string) {
    const rows = await this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { enrolledAt: 'desc' },
    });
    return {
      data: rows.map((e) => ({
        id: e.course.id,
        title: e.course.title,
        isMandatory: e.course.isMandatory,
        enrolledAt: e.enrolledAt.toISOString(),
        progress: e.progress,
        completedAt: e.completedAt ? e.completedAt.toISOString() : null,
      })),
    };
  }
}
