import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ERROR_MESSAGES } from '../../../common/constants';

export class ResetPasswordDto {
  @IsNotEmpty({ message: ERROR_MESSAGES.VALIDATION.RESET_TOKEN_REQUIRED })
  @IsString()
  token: string;

  @IsNotEmpty({ message: ERROR_MESSAGES.VALIDATION.NEW_PASSWORD_REQUIRED })
  @IsString()
  @MinLength(6, { message: ERROR_MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH })
  newPassword: string;
}
