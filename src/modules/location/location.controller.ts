import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LocationService } from './location.service';

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

  @Get('addresses/user/:userId')
  findAddressesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.locationService.findAddressesByUser(userId);
  }
}
