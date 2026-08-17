import { IsEmail, IsNotEmpty } from 'class-validator';
import { ERROR_MESSAGES } from '../../../common/constants';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: ERROR_MESSAGES.VALIDATION.EMAIL_REQUIRED })
  @IsEmail({}, { message: ERROR_MESSAGES.VALIDATION.EMAIL_INVALID })
  email: string;
}
