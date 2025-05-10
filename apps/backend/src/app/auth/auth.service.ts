import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async login(user: { username: string; password: string }) {
    const dbUser = await this.usersService.getUser({ username: user.username });

    if (!dbUser || dbUser.password !== user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { username: dbUser.username, sub: dbUser.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
