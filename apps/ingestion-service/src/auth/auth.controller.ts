import { Controller, Post, Body, UseGuards, Get, Delete, Patch, Param } from '@nestjs/common';
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

  @Public()
  @ApiOperation({ summary: 'Se connecter et obtenir un Token JWT' })
  @Post('login')
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @ApiOperation({ summary: '[ADMIN ONLY] Lister tous les utilisateurs' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  getUsers() {
    return this.authService.getUsers();
  }

  @ApiOperation({ summary: '[ADMIN ONLY] Modifier un utilisateur' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.authService.updateUser(id, body);
  }

  @ApiOperation({ summary: '[ADMIN ONLY] Supprimer un utilisateur' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
