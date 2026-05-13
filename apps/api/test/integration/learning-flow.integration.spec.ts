import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import * as path from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

type AuthBody = {
  token: string;
  user: { id: string; email: string; name: string };
};

type CatalogBody = { data: { id: string }[] };

type EnrollBody = { message: string; enrolledAt: string };

/** Requires PostgreSQL and `DATABASE_URL`. Applies migrations then exercises HTTP stack. */
describe('Learning flow (HTTP integration)', () => {
  let app: INestApplication | undefined;
  let prisma: PrismaService | undefined;
  let courseId: string;
  const testEmail = `integration-${randomUUID()}@example.test`;
  const testPassword = 'SecurePass1!';
  const testName = 'Integration User';

  function http() {
    if (!app) {
      throw new Error('Nest application was not initialized');
    }
    return request(app.getHttpServer() as Server);
  }

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set to run integration tests');
    }

    const apiRoot = path.join(__dirname, '../..');
    const repoRoot = path.join(apiRoot, '..');
    const migrate = spawnSync(
      'pnpm',
      ['--filter', 'api', 'exec', 'prisma', 'migrate', 'deploy'],
      {
        cwd: repoRoot,
        encoding: 'utf-8',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      },
    );
    if (migrate.error) {
      throw migrate.error;
    }
    if (migrate.status !== 0) {
      throw new Error(
        `prisma migrate deploy failed (exit ${migrate.status}):\n${migrate.stdout ?? ''}\n${migrate.stderr ?? ''}`,
      );
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    courseId = randomUUID();
    await prisma.course.create({
      data: {
        id: courseId,
        title: 'Integration test course',
        description: 'Temporary row for automated tests',
        category: 'Test',
        durationHours: 1,
        isMandatory: false,
      },
    });
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.enrollment.deleteMany({ where: { courseId } });
    await prisma.course.deleteMany({ where: { id: courseId } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await app?.close();
  });

  it('register → login → catalog → enroll → my courses', async () => {
    const reg = await http()
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword,
      })
      .expect(201);

    const regBody = reg.body as AuthBody;
    expect(regBody.user).toMatchObject({ email: testEmail, name: testName });
    expect(typeof regBody.token).toBe('string');

    const login = await http()
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    const loginBody = login.body as AuthBody;
    const token = loginBody.token;
    expect(typeof token).toBe('string');

    const catalog = await http()
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const catalogBody = catalog.body as CatalogBody;
    const ids = catalogBody.data.map((c) => c.id);
    expect(ids).toContain(courseId);

    const enroll = await http()
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const enrollBody = enroll.body as EnrollBody;
    expect(enrollBody.message).toBe('Successfully enrolled');
    expect(typeof enrollBody.enrolledAt).toBe('string');

    const mine = await http()
      .get('/api/users/me/courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const mineBody = mine.body as CatalogBody;
    const mineIds = mineBody.data.map((c) => c.id);
    expect(mineIds).toContain(courseId);
  });

  it('returns 409 when enrolling twice in the same course', async () => {
    const email = `integration-2-${randomUUID()}@example.test`;
    const reg = await http()
      .post('/api/auth/register')
      .send({
        name: 'Second User',
        email,
        password: testPassword,
      })
      .expect(201);

    const regBody = reg.body as AuthBody;
    const token = regBody.token;

    await http()
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await http()
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);

    await prisma!.user.deleteMany({ where: { email } });
  });
});
