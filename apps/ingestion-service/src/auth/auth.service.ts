import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './auth.dto';
import { RegisterDto } from './register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Creates a new user account.
   * Only a connected ADMIN can call this method (enforced by the controller).
   */
  async register(data: RegisterDto) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException(`An account with email "${data.email}" already exists.`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const userRole = data.role || 'DOCTOR';
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Create Practitioner profile automatically if role is DOCTOR
    if (userRole === 'DOCTOR') {
      await this.prisma.practitioner.create({
        data: {
          userId: user.id,
          firstName: data.firstName || 'To be defined',
          lastName: data.lastName || 'To be defined',
          specialty: data.specialty || 'General Practice',
          email: data.email,
        },
      });
    }

    const { password, ...result } = user;
    return result;
  }

  /**
   * Lists all users on the platform.
   * Reserved for administration.
   */
  async getUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        practitioner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          }
        }
      }
    });
    return users;
  }

  /**
   * Deletes a user.
   */
  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Updates a user (role, email, and/or practitioner info).
   */
  async updateUser(id: string, data: {
    email?: string;
    role?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    specialty?: string;
  }) {
    // 1. Update the User
    const userUpdate: any = {};
    if (data.email) userUpdate.email = data.email;
    if (data.role) userUpdate.role = data.role;
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      userUpdate.password = await bcrypt.hash(data.password, salt);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: userUpdate,
    });

    // 2. Update the Practitioner profile if it exists
    if (data.firstName || data.lastName || data.specialty) {
      const existing = await this.prisma.practitioner.findUnique({
        where: { userId: id },
      });

      if (existing) {
        await this.prisma.practitioner.update({
          where: { userId: id },
          data: {
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.specialty && { specialty: data.specialty }),
            ...(data.email && { email: data.email }),
          },
        });
      } else if (user.role === 'DOCTOR') {
        // Create practitioner profile if role was just changed to DOCTOR
        await this.prisma.practitioner.create({
          data: {
            userId: id,
            firstName: data.firstName || 'À définir',
            lastName: data.lastName || 'À définir',
            specialty: data.specialty || 'Généraliste',
            email: user.email,
          },
        });
      }
    }

    const { password, ...result } = user;
    return result;
  }

  async login(data: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
    };
  }
}
