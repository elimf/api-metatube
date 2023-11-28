import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User, UserRole } from '../user/schema/user.schema';
import { AuthModule } from './auth.module';
import { JwtStrategy } from './strategies/jwt-strategy';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;
  interface AuthToken {
    access_token: string;
    refresh_token: string;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UserService, JwtStrategy],
      imports: [AuthModule],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('login', () => {
    it('should return a token', async () => {
      const mockLoginRequest = {
        user: {
          email: 'mock@example.com',
          password: 'mockPassword',
        },
      };

      const mockToken: AuthToken = {
        access_token: 'your_access_token_here',
        refresh_token: 'your_refresh_token_here',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockToken);

      expect(await authController.login(mockLoginRequest)).toBe(mockToken);
    });
  });

  describe('registerUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'hunchoteach',
        email: 'johndoe@example.com',
        password: 'motdepasse123',
      };

      const result: User = {
        _id: '656545a292d618d3a83993b9',
        username: 'hunchoteach',
        email: 'johndoe@example45.com',
        password:
          '$2b$10$JTsRwGAh0lk4boixirKT/OOHU1e3Aut..y31yiJGv4PJg8V1AhU8m',
        avatar: '',
        banner: '',
        description: '',
        subscriptions: [],
        videos: [],
        playlists: [],
        history: [],
        likedVideos: [],
        role: UserRole.USER,
      } as User;

      jest
        .spyOn(userService, 'createUser')
        .mockResolvedValue(Promise.resolve(result)); // Wrap the result in Promise.resolve

      const registeredUser = await authController.registerUser(createUserDto);

      // Resolve the promise before comparing
      expect(registeredUser).toBe(result);
    });
  });

  describe('refreshToken', () => {
    it('should return a new token', async () => {
      const user = {
        email: 'string',
        role: 'role',
        sub: {
          username: 'string',
        },
      };
      const mockToken: AuthToken = {
        access_token: 'your_access_token_here',
        refresh_token: 'your_refresh_token_here',
      };

      jest
        .spyOn(authService, 'refreshToken')
        .mockReturnValue(Promise.resolve(mockToken));

      expect(await authController.refrshToken({ user })).toBe(mockToken);
    });
  });
});
