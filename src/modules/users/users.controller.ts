import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.USERS.FETCH_ALL_SUCCESS)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.USERS.FETCH_ONE_SUCCESS)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}
