import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UserStatus } from '../../common/enums/enums';
import { User } from '../users/entities/user.entity';
import { ERROR_MESSAGES, RESPONSE_MESSAGES } from '../../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException(ERROR_MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED);
    }

    const roleName = registerDto.role.toLowerCase().trim();
    const roleEntity = await this.usersService.findRoleByName(roleName);
    if (!roleEntity) {
      throw new BadRequestException(
        `Role '${registerDto.role}' is invalid. Available roles: admin, vendor, customer, delivery_agent`,
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      mobile_number: registerDto.mobile_number,
      status: UserStatus.ACTIVE,
    });

    await this.usersService.assignRoleToUser(newUser.id, roleEntity.id);

    const userWithRoles = await this.usersService.findById(newUser.id);
    const accessToken = await this.generateToken(userWithRoles || newUser);

    return {
      message: RESPONSE_MESSAGES.AUTH.REGISTER_SUCCESS,
      accessToken,
      user: this.sanitizeUser(userWithRoles || newUser),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCOUNT_SUSPENDED);
    }

    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.ACCOUNT_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const accessToken = await this.generateToken(user);

    return {
      message: RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS,
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.AUTH.EMAIL_NOT_FOUND);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCOUNT_SUSPENDED);
    }

    if (user.status === UserStatus.DELETED) {
      throw new NotFoundException(ERROR_MESSAGES.AUTH.EMAIL_NOT_FOUND);
    }

    const resetToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: 'password_reset',
      },
      { expiresIn: '15m' },
    );

    return {
      message: RESPONSE_MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS,
      resetToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(resetPasswordDto.token);
    } catch {
      throw new BadRequestException(
        ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_RESET_TOKEN,
      );
    }

    if (payload?.type !== 'password_reset') {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.INVALID_TOKEN_TYPE);
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return { message: RESPONSE_MESSAGES.AUTH.RESET_PASSWORD_SUCCESS };
  }

  private async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.user_roles?.map((ur) => ur.role?.name).filter(Boolean) || [],
    };
    return this.jwtService.signAsync(payload);
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
