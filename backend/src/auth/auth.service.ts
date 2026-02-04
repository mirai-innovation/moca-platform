import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './schemas/user.schema';

export interface AuthResult {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(dto: { name: string; email: string; password: string }): Promise<AuthResult> {
    const normalizedEmail = String(dto.email).toLowerCase().trim();
    const existing = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (existing) {
      throw new ConflictException('El correo ya está registrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.userModel.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'professional',
      isActive: true,
    });

    return this.buildAuthResult(user);
  }

  async login(dto: { email: string; password: string }): Promise<AuthResult> {
    const normalizedEmail = String(dto.email).toLowerCase().trim();
    const user = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tu cuenta está inactiva. Contacta al administrador.');
    }

    return this.buildAuthResult(user);
  }

  async validateUserById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  private buildAuthResult(user: UserDocument): AuthResult {
    const payload = { sub: user._id.toString() };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '8h',
    });
    return {
      token,
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
