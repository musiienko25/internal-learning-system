import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Controller('users')
export class UsersController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('me/courses')
  @UseGuards(AuthGuard('jwt'))
  getMyCourses(@CurrentUser() user: AuthUser) {
    return this.enrollmentsService.listForUser(user.userId);
  }
}
