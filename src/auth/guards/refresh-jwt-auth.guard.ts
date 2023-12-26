import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
 interface PayloadType {
   id: string;
   iat: number;
   exp: number;
 }
@Injectable()
export class RefreshJwtGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing JWT token');
    }
    const payload = await this.verifyJwtToken(token);
    console.log(`payload: ${JSON.stringify(payload)}`);

    request['user'] = payload;
    return true;
  }
  private extractTokenFromHeader(request: any): string | undefined {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return undefined;
    }

    const [type, token] = authorizationHeader.split(' ') || [];

    if (type === 'Bearer' && token) {
      return token;
    }

    return undefined;
  }
  private async verifyJwtToken(token): Promise<PayloadType> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: true,
      });

      return payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid JWT token');
    }
  }
}