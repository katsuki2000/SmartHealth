import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { RegisterDto } from './register.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 🔒 Seul un ADMIN connecté peut créer un nouveau compte.
   * Le tout premier admin est créé via le script de seed.
   */
  @ApiOperation({
    summary: '[ADMIN ONLY] Créer un compte Docteur ou Admin',
    description:
      'Route protégée : nécessite un token JWT avec le rôle ADMIN. ' +
      'Utilisez le script "pnpm run seed" pour créer le premier administrateur.',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 🟢 Route publique — permet à tout utilisateur existant de se connecter.
   */
  @Public()
  @ApiOperation({ summary: 'Se connecter et obtenir un Token JWT' })
  @Post('login')
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }
}
