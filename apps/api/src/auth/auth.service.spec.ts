import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;

  const prisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('test-jwt'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('register returns user and token', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 't@example.com',
      passwordHash: 'hash',
    });

    const dto: RegisterDto = {
      name: 'Test User',
      email: 't@example.com',
      password: 'secret12',
    };
    const result = await service.register(dto);

    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 't@example.com',
    });
    expect(result.token).toBe('test-jwt');
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'user-1' });
  });

  it('register throws ConflictException on duplicate email', async () => {
    const err = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: 'test',
    });
    prisma.user.create.mockRejectedValue(err);

    const dto: RegisterDto = {
      name: 'Test',
      email: 'dup@example.com',
      password: 'secret12',
    };
    await expect(service.register(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('login throws when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const dto: LoginDto = { email: 'nope@example.com', password: 'x' };
    await expect(service.login(dto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('login throws when password invalid', async () => {
    const hash = bcrypt.hashSync('correct', 4);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      name: 'A',
      email: 'a@a.com',
      passwordHash: hash,
    });
    const dto: LoginDto = { email: 'a@a.com', password: 'wrong' };
    await expect(service.login(dto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
