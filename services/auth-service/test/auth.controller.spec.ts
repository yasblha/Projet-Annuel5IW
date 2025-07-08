import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from '@application/dtos/auth/update-profile.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      loginUser: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com', nom: 'Test', prenom: 'User', role: 'CLIENT' }),
      updateProfile: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com', nom: 'Test', prenom: 'User', role: 'CLIENT' }),
      getUserById: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com', nom: 'Test', prenom: 'User', role: 'CLIENT' }),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
      verify: jest.fn().mockReturnValue({ sub: 1, email: 'test@test.com', role: 'CLIENT' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login should return access_token and user', async () => {
    const dto = { email: 'test@test.com', password: 'password' };
    const result = await controller.handleLogin(dto);
    expect(result.success).toBe(true);
    expect(result.data.access_token).toBe('jwt-token');
    expect(result.data.user.email).toBe('test@test.com');
  });

  it('updateProfile should update and return user', async () => {
    const req = { user: { sub: 1 } };
    const dto: UpdateProfileDto = { nom: 'Nouveau', prenom: 'Nom' };
    const result = await controller.updateProfile(req, dto);
    expect(result.success).toBe(true);
    expect(usersService.updateProfile).toHaveBeenCalledWith(1, dto);
    expect(result.data.nom).toBe('Test');
  });

  it('refresh should return new token and user', async () => {
    const data = { userId: 1 };
    const result = await controller.handleRefresh(data);
    expect(result.success).toBe(true);
    expect(result.data.access_token).toBe('jwt-token');
    expect(result.data.user.email).toBe('test@test.com');
  });

  it('logout should return success', async () => {
    // Simule un header d'authorization
    const req = { headers: { authorization: 'Bearer fake-token' } };
    const data = { userId: 1 };
    const result = await controller.handleLogout(data, req);
    expect(result.success).toBe(true);
    expect(result.message).toContain('Déconnexion');
  });
});
