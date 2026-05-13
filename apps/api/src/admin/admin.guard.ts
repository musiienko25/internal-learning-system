import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const configured = process.env.ADMIN_API_KEY?.trim();
    if (!configured) {
      throw new ForbiddenException('Admin API is disabled (set ADMIN_API_KEY)');
    }
    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.header('x-admin-key')?.trim();
    if (provided !== configured) {
      throw new ForbiddenException('Invalid admin key');
    }
    return true;
  }
}
