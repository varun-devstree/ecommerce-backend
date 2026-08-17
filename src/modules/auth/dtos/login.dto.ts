import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ERROR_MESSAGES } from '../../../common/constants';

export class LoginDto {
  @IsNotEmpty({ message: ERROR_MESSAGES.VALIDATION.EMAIL_REQUIRED })
  @IsEmail({}, { message: ERROR_MESSAGES.VALIDATION.EMAIL_INVALID })
  email: string;

  @IsNotEmpty({ message: ERROR_MESSAGES.VALIDATION.PASSWORD_REQUIRED })
  @IsString()
  @MinLength(6, { message: ERROR_MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH })
  password: string;
}
