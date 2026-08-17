import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DeliveryAgentsService } from './delivery-agents.service';

@Controller('delivery-agents')
export class DeliveryAgentsController {
  constructor(private readonly deliveryAgentsService: DeliveryAgentsService) {}

  @Get()
  findAll() {
    return this.deliveryAgentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryAgentsService.findOne(id);
  }
}
