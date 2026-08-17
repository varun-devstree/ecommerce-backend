import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

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
  ) { }

  findAllCountries() {
    return this.countryRepository.find();
  }

  findStatesByCountry(countryId: number) {
    return this.stateRepository.find({ where: { country_id: countryId } });
  }

  findCitiesByState(stateId: number) {
    return this.cityRepository.find({ where: { state_id: stateId } });
  }

  async createAddress(createAddressDto: CreateAddressDto): Promise<Address> {
    if (createAddressDto.is_default) {
      await this.addressRepository.update(
        { user_id: createAddressDto.user_id },
        { is_default: false },
      );
    }

    const address = this.addressRepository.create(createAddressDto);
    const saved = await this.addressRepository.save(address);
    return this.findAddressById(saved.id);
  }

  findAddressesByUser(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { user_id: userId },
      relations: { country: true, state: true, city: true },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async findAddressById(id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: { country: true, state: true, city: true },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async updateAddress(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.findAddressById(id);

    if (updateAddressDto.is_default) {
      await this.addressRepository.update(
        { user_id: address.user_id },
        { is_default: false },
      );
    }

    Object.assign(address, updateAddressDto);
    await this.addressRepository.save(address);
    return this.findAddressById(id);
  }

  async removeAddress(id: number): Promise<{ message: string }> {
    const address = await this.findAddressById(id);
    address.status = 'deleted';
    await this.addressRepository.save(address);
    await this.addressRepository.softRemove(address);
    return { message: `Address with ID ${id} successfully deleted` };
  }

  async setDefaultAddress(id: number): Promise<Address> {
    const address = await this.findAddressById(id);

    await this.addressRepository.update(
      { user_id: address.user_id },
      { is_default: false },
    );

    address.is_default = true;
    await this.addressRepository.save(address);
    return this.findAddressById(id);
  }
}
