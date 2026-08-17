import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('countries')
  findAllCountries() {
    return this.locationService.findAllCountries();
  }

  @Get('countries/:countryId/states')
  findStatesByCountry(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.locationService.findStatesByCountry(countryId);
  }

  @Get('states/:stateId/cities')
  findCitiesByState(@Param('stateId', ParseIntPipe) stateId: number) {
    return this.locationService.findCitiesByState(stateId);
  }

  // Address CRUD Endpoints
  @Post('addresses')
  createAddress(@Body() createAddressDto: CreateAddressDto) {
    return this.locationService.createAddress(createAddressDto);
  }

  @Get('addresses/user/:userId')
  findAddressesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.locationService.findAddressesByUser(userId);
  }

  @Get('addresses/:id')
  findAddressById(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findAddressById(id);
  }

  @Patch('addresses/:id')
  updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.locationService.updateAddress(id, updateAddressDto);
  }

  @Delete('addresses/:id')
  removeAddress(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.removeAddress(id);
  }

  @Patch('addresses/:id/set-default')
  setDefaultAddress(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.setDefaultAddress(id);
  }
}
