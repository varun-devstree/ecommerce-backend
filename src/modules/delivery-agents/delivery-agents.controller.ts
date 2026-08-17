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

@Controller('delivery-agents')
export class DeliveryAgentsController {
  constructor(
    private readonly deliveryAgentsService: DeliveryAgentsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Delivery agents fetched successfully')
  findAll() {
    return this.deliveryAgentsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Delivery agent details fetched successfully')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryAgentsService.findOne(id);
  }
}
