import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.REGISTER_SUCCESS)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.PROFILE_FETCH_SUCCESS)
  getProfile(@Request() req) {
    const { password, ...user } = req.user;
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.RESET_PASSWORD_SUCCESS)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
