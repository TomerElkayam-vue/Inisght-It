import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/user.service";
import { InsiteitUser } from "@packages/projects";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  private readonly pepper: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {
    this.pepper = process.env.PEPPER_SECRET || "default-pepper";
  }

  private async hashPassword(password: string): Promise<string> {
    const pepperedPassword = password + this.pepper;
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(pepperedPassword, salt);
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    const pepperedPassword = plainPassword + this.pepper;
    return bcrypt.compare(pepperedPassword, hashedPassword);
  }

  private generateRefreshToken(userId: string): string {
    const refreshPayload = {
      sub: userId,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
    };
    return this.jwtService.sign(refreshPayload, { expiresIn: "7d" });
  }

  private generateAccessToken(userId: string, username: string): string {
    const payload = { username, sub: userId };
    return this.jwtService.sign(payload, { expiresIn: "15m" });
  }

  async login(user: { username: string; password: string }) {
    const dbUser = await this.usersService.getUser({ username: user.username });

    if (
      !dbUser ||
      !(await this.verifyPassword(user.password, dbUser.password))
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(dbUser.id, dbUser.username);
    const refreshToken = this.generateRefreshToken(dbUser.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(user: InsiteitUser) {
    const existingUser = await this.usersService.getUser({
      username: user.username,
    });

    if (!user.username || !user.password || !user.firstName || !user.lastName) {
      throw new ConflictException("All fields must be filled");
    }

    if (existingUser) {
      throw new ConflictException("Username already exists");
    }

    const hashedPassword = await this.hashPassword(user.password);

    const newUser = await this.usersService.createUser({
      username: user.username,
      password: hashedPassword,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const accessToken = this.generateAccessToken(newUser.id, newUser.username);
    const refreshToken = this.generateRefreshToken(newUser.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken) as any;

      if (decoded.type !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token type");
      }

      const user = await this.usersService.getUser({ id: decoded.sub });
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const newAccessToken = this.generateAccessToken(user.id, user.username);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }
}
