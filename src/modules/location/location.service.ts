import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { Address } from './entities/address.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  findAllCountries() {
    return this.countryRepository.find();
  }

  findStatesByCountry(countryId: number) {
    return this.stateRepository.find({ where: { country_id: countryId } });
  }

  findCitiesByState(stateId: number) {
    return this.cityRepository.find({ where: { state_id: stateId } });
  }

  findAddressesByUser(userId: number) {
    return this.addressRepository.find({
      where: { user_id: userId },
      relations: { country: true, state: true, city: true },
    });
  }
}
