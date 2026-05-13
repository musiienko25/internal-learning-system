import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createDatabasePrismaClient } from '../src/prisma/create-prisma';

const prisma = createDatabasePrismaClient();

const SEED_USER_ID = '20000000-0000-4000-8000-000000000001';
const SEED_EMAIL = 'trainer@bank.ua';
const SEED_PASSWORD = 'Test123!';

const courses = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    title: 'AML Awareness Q2',
    description:
      'Основи фінансового моніторингу та KYC процедур для фронт-офісу.',
    category: 'Compliance',
    durationHours: 4,
    isMandatory: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    title: 'Інформаційна безпека',
    description: 'Фішинг, паролі, робота з корпоративними пристроями та даними.',
    category: 'Security',
    durationHours: 2,
    isMandatory: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    title: 'Сервісна культура з клієнтом',
    description: 'Комунікація, емпатія та робота зі скаргами в каналах банку.',
    category: 'Soft Skills',
    durationHours: 3,
    isMandatory: false,
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    title: 'Продукти роздрібного кредитування',
    description: 'Кредитні картки, кеш-кредит, ризики та відповідальне кредитування.',
    category: 'Products',
    durationHours: 5,
    isMandatory: false,
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    title: 'GDPR та захист персональних даних',
    description: 'Принципи обробки ПДн, запити клієнтів, інциденти та журналювання.',
    category: 'Compliance',
    durationHours: 2,
    isMandatory: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    title: 'Внутрішні процеси та документообіг',
    description: 'ЕДО, погодження, зберігання документів і аудитний слід.',
    category: 'Operations',
    durationHours: 3,
    isMandatory: false,
  },
];

async function main() {
  const passwordHash = bcrypt.hashSync(SEED_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: {
      name: 'Тренер Сидоренко',
      passwordHash,
    },
    create: {
      id: SEED_USER_ID,
      name: 'Тренер Сидоренко',
      email: SEED_EMAIL,
      passwordHash,
    },
  });

  for (const course of courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {
        title: course.title,
        description: course.description,
        category: course.category,
        durationHours: course.durationHours,
        isMandatory: course.isMandatory,
      },
      create: course,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
