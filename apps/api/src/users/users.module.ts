import { Module } from '@nestjs/common';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { UsersController } from './users.controller';

@Module({
  imports: [EnrollmentsModule],
  controllers: [UsersController],
})
export class UsersModule {}
