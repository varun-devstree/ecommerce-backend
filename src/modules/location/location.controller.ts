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
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('countries')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.LOCATION.FETCH_COUNTRIES_SUCCESS)
  findAllCountries() {
    return this.locationService.findAllCountries();
  }

  @Get('countries/:countryId/states')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.LOCATION.FETCH_STATES_SUCCESS)
  findStatesByCountry(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.locationService.findStatesByCountry(countryId);
  }

  @Get('states/:stateId/cities')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.LOCATION.FETCH_CITIES_SUCCESS)
  findCitiesByState(@Param('stateId', ParseIntPipe) stateId: number) {
    return this.locationService.findCitiesByState(stateId);
  }

  // Address CRUD Endpoints
  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.LOCATION.CREATE_ADDRESS_SUCCESS)
  createAddress(@Body() createAddressDto: CreateAddressDto) {
    return this.locationService.createAddress(createAddressDto);
  }

  @Get('addresses/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.LOCATION.FETCH_USER_ADDRESSES_SUCCESS)
  findAddressesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.locationService.findAddressesByUser(userId);
  }

  @Get('addresses/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.LOCATION.FETCH_ADDRESS_ONE_SUCCESS)
  findAddressById(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findAddressById(id);
  }

  @Patch('addresses/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.LOCATION.UPDATE_ADDRESS_SUCCESS)
  updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.locationService.updateAddress(id, updateAddressDto);
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.LOCATION.DELETE_ADDRESS_SUCCESS)
  removeAddress(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.removeAddress(id);
  }

  @Patch('addresses/:id/set-default')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.LOCATION.SET_DEFAULT_ADDRESS_SUCCESS)
  setDefaultAddress(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.setDefaultAddress(id);
  }
}
