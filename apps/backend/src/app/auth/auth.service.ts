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

  async login(user: { username: string; password: string }) {
    const dbUser = await this.usersService.getUser({ username: user.username });

    if (
      !dbUser ||
      !(await this.verifyPassword(user.password, dbUser.password))
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { username: dbUser.username, sub: dbUser.id };

    return {
      access_token: this.jwtService.sign(payload),
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

    const payload = { username: newUser.username, sub: newUser.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
