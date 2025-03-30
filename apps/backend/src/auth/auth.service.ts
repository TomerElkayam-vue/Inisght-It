import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };

    if (user.password !== 'password' || user.username !== 'username') {
      return { message: 'Invalid credentials' };
    }

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}