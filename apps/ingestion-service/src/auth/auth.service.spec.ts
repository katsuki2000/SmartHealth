import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    role: 'user',
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const authDto = { email: 'newuser@example.com', password: 'password123' };

      mockPrismaService.user.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      const result = await service.register(authDto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(authDto.password, 'salt');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: authDto.email,
          password: 'hashedpassword',
        },
      });
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
    });

    it('should not return the password in the response', async () => {
      const authDto = { email: 'newuser@example.com', password: 'password123' };

      mockPrismaService.user.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      const result = await service.register(authDto);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const authDto = { email: 'test@example.com', password: 'password123' };
      const token = 'jwt-token';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(authDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        authDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result.access_token).toBe(token);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const authDto = { email: 'nonexistent@example.com', password: 'password123' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(authDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const authDto = { email: 'test@example.com', password: 'wrongpassword' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(authDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        authDto.password,
        mockUser.password,
      );
    });
  });
});
