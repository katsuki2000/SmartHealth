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
   * Crée un nouveau compte utilisateur.
   * Seul un ADMIN connecté peut appeler cette méthode (vérifié par le controller).
   */
  async register(data: RegisterDto) {
    // Vérifier si l'email existe déjà
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException(`Un compte avec l'email "${data.email}" existe déjà.`);
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

    // Créer le profil Practitioner automatiquement si c'est un DOCTOR
    if (userRole === 'DOCTOR') {
      await this.prisma.practitioner.create({
        data: {
          userId: user.id,
          firstName: data.firstName || 'À définir',
          lastName: data.lastName || 'À définir',
          specialty: data.specialty || 'Généraliste',
          email: data.email,
        },
      });
    }

    // Don't return the password in the response!
    const { password, ...result } = user;
    return result;
  }

  /**
   * Liste tous les utilisateurs de la plateforme.
   * Réservé à l'administration.
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
   * Supprime un utilisateur.
   */
  async deleteUser(id: string) {
    // Note : Prisma gère les relations, mais on doit faire attention aux cascade deletes si configuré.
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Met à jour un utilisateur (rôle, email, et/ou infos praticien).
   */
  async updateUser(id: string, data: {
    email?: string;
    role?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    specialty?: string;
  }) {
    // 1. Mettre à jour le User
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

    // 2. Mettre à jour le profil Practitioner s'il existe
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
        // Créer le profil praticien si le rôle vient de passer à DOCTOR
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
