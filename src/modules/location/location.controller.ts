import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('countries')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Countries fetched successfully')
  findAllCountries() {
    return this.locationService.findAllCountries();
  }

  @Get('countries/:countryId/states')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('States fetched successfully')
  findStatesByCountry(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.locationService.findStatesByCountry(countryId);
  }

  @Get('states/:stateId/cities')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cities fetched successfully')
  findCitiesByState(@Param('stateId', ParseIntPipe) stateId: number) {
    return this.locationService.findCitiesByState(stateId);
  }

  // Address CRUD Endpoints
  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Address created successfully')
  createAddress(@Body() createAddressDto: CreateAddressDto) {
    return this.locationService.createAddress(createAddressDto);
  }

  @Get('addresses/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User addresses fetched successfully')
  findAddressesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.locationService.findAddressesByUser(userId);
  }

  @Get('addresses/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Address details fetched successfully')
  findAddressById(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findAddressById(id);
  }

  @Patch('addresses/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Address updated successfully')
  updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.locationService.updateAddress(id, updateAddressDto);
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Address deleted successfully')
  removeAddress(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.removeAddress(id);
  }

  @Patch('addresses/:id/set-default')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Default address set successfully')
  setDefaultAddress(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.setDefaultAddress(id);
  }
}
