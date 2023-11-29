import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  export class JwtAuthAdminGuard extends AuthGuard('jwt') {
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
      const userRole = payload.role;
      this.validateUserRole(userRole);
  
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
    private validateUserRole(userRole) {
      if (userRole !== 'admin') {
        throw new UnauthorizedException(
          'Unauthorized access for administrators only ',
        );
      }
    }
    private async verifyJwtToken(token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
        return payload;
      } catch (error) {
        throw new UnauthorizedException('Invalid JWT token');
      }
    }
  }