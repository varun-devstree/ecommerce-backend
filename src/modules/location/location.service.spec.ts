import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { Address } from './entities/address.entity';
import { NotFoundException } from '@nestjs/common';

describe('LocationService', () => {
  let service: LocationService;

  const mockAddressRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCountryRepository = { find: jest.fn() };
  const mockStateRepository = { find: jest.fn() };
  const mockCityRepository = { find: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountryRepository,
        },
        {
          provide: getRepositoryToken(State),
          useValue: mockStateRepository,
        },
        {
          provide: getRepositoryToken(City),
          useValue: mockCityRepository,
        },
        {
          provide: getRepositoryToken(Address),
          useValue: mockAddressRepository,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAddress', () => {
    it('should create and return a new address', async () => {
      const dto = {
        user_id: 1,
        name: 'John Doe',
        mobile_number: '1234567890',
        address_line_1: '123 Main St',
        country_id: 1,
        state_id: 1,
        city_id: 1,
        postal_code: '10001',
        is_default: true,
      };

      mockAddressRepository.update.mockResolvedValue({});
      mockAddressRepository.create.mockReturnValue(dto);
      mockAddressRepository.save.mockResolvedValue({ id: 10, ...dto });
      mockAddressRepository.findOne.mockResolvedValue({ id: 10, ...dto });

      const result = await service.createAddress(dto);

      expect(mockAddressRepository.update).toHaveBeenCalledWith(
        { user_id: 1 },
        { is_default: false },
      );
      expect(mockAddressRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 10, ...dto });
    });
  });

  describe('findAddressById', () => {
    it('should return address if found', async () => {
      const mockAddress = { id: 1, name: 'Home' };
      mockAddressRepository.findOne.mockResolvedValue(mockAddress);

      const result = await service.findAddressById(1);
      expect(result).toEqual(mockAddress);
    });

    it('should throw NotFoundException if address not found', async () => {
      mockAddressRepository.findOne.mockResolvedValue(null);

      await expect(service.findAddressById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
