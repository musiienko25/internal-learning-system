import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.coursesService.findAllCatalog();
  }

  @Post(':id/enroll')
  @UseGuards(AuthGuard('jwt'))
  enroll(
    @Param('id', new ParseUUIDPipe({ version: '4' })) courseId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.enrollmentsService.enroll(user.userId, courseId);
  }
}
