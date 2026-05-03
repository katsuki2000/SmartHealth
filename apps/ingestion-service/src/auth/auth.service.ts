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
