import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DeliveryAgentsService } from './delivery-agents.service';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('delivery-agents')
export class DeliveryAgentsController {
  constructor(
    private readonly deliveryAgentsService: DeliveryAgentsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.DELIVERY_AGENTS.FETCH_ALL_SUCCESS)
  findAll() {
    return this.deliveryAgentsService.findAll();
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.DELIVERY_AGENTS.FETCH_ONE_SUCCESS)
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.deliveryAgentsService.findByUserId(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.DELIVERY_AGENTS.FETCH_ONE_SUCCESS)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryAgentsService.findOne(id);
  }
}
