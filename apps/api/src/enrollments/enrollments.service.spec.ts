import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from './enrollments.service';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;

  const prisma = {
    course: { findUnique: jest.fn() },
    enrollment: { create: jest.fn(), findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(EnrollmentsService);
  });

  it('enroll throws NotFoundException when course missing', async () => {
    prisma.course.findUnique.mockResolvedValue(null);
    await expect(service.enroll('user-1', 'course-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('enroll throws ConflictException on duplicate enrollment', async () => {
    prisma.course.findUnique.mockResolvedValue({
      id: 'c1',
      title: 'T',
      description: 'd',
      category: 'x',
      durationHours: 1,
      isMandatory: false,
    });
    const err = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: 'test',
    });
    prisma.enrollment.create.mockRejectedValue(err);

    await expect(service.enroll('user-1', 'c1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('listForUser maps enrollments', async () => {
    prisma.enrollment.findMany.mockResolvedValue([
      {
        course: {
          id: 'c1',
          title: 'Course',
          isMandatory: true,
        },
        enrolledAt: new Date('2026-01-01T00:00:00.000Z'),
        progress: 0,
        completedAt: null,
      },
    ]);

    const result = await service.listForUser('user-1');
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'c1',
      title: 'Course',
      isMandatory: true,
      progress: 0,
      completedAt: null,
    });
  });
});
