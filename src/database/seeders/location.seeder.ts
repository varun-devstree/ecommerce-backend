import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country as cscCountry, State as cscState, City as cscCity } from 'country-state-city';
import { Country } from '../../modules/location/entities/country.entity';
import { State } from '../../modules/location/entities/state.entity';
import { City } from '../../modules/location/entities/city.entity';

@Injectable()
export class LocationSeeder {
  private readonly logger = new Logger(LocationSeeder.name);

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async seed() {
    this.logger.log('Starting Location Seeder (Countries, States, Cities)...');

    // 1. Seed Countries
    const countryMap = new Map<string, number>(); // isoCode -> country.id
    const existingCountriesCount = await this.countryRepository.count();

    if (existingCountriesCount > 0) {
      this.logger.log(`Countries already seeded (${existingCountriesCount} found). Loading existing map...`);
      const existingCountries = await this.countryRepository.find({
        select: { id: true, iso_code: true },
      });
      for (const c of existingCountries) {
        if (c.iso_code) {
          countryMap.set(c.iso_code, c.id);
        }
      }
    } else {
      const allCscCountries = cscCountry.getAllCountries();
      this.logger.log(`Seeding ${allCscCountries.length} countries...`);

      const countryEntities = allCscCountries.map((c) => ({
        name: (c.name || '').substring(0, 100),
        iso_code: (c.isoCode || '').substring(0, 10),
        phone_code: (c.phonecode || '').substring(0, 10),
      }));

      const BATCH_SIZE = 100;
      for (let i = 0; i < countryEntities.length; i += BATCH_SIZE) {
        const batch = countryEntities.slice(i, i + BATCH_SIZE);
        await this.countryRepository
          .createQueryBuilder()
          .insert()
          .into(Country)
          .values(batch)
          .orIgnore()
          .execute();
      }

      const insertedCountries = await this.countryRepository.find({
        select: { id: true, iso_code: true },
      });
      for (const c of insertedCountries) {
        if (c.iso_code) {
          countryMap.set(c.iso_code, c.id);
        }
      }
      this.logger.log(`Successfully seeded ${insertedCountries.length} countries.`);
    }

    // 2. Seed States
    const stateMap = new Map<string, number>(); // countryIso_stateCode or countryIso_stateName -> state.id
    const existingStatesCount = await this.stateRepository.count();

    if (existingStatesCount > 0) {
      this.logger.log(`States already seeded (${existingStatesCount} found). Loading existing map...`);
      const existingStates = await this.stateRepository.find({
        select: { id: true, country_id: true, code: true, name: true },
      });
      const idToIso = new Map<number, string>();
      for (const [iso, id] of countryMap.entries()) {
        idToIso.set(id, iso);
      }
      for (const s of existingStates) {
        const iso = idToIso.get(s.country_id);
        if (iso) {
          if (s.code) stateMap.set(`${iso}_${s.code}`, s.id);
          stateMap.set(`${iso}_${s.name}`, s.id);
        }
      }
    } else {
      const allCscStates = cscState.getAllStates();
      this.logger.log(`Seeding ${allCscStates.length} states...`);

      const stateEntities: { country_id: number; name: string; code?: string }[] = [];
      const stateKeysSet = new Set<string>();

      for (const s of allCscStates) {
        const countryId = countryMap.get(s.countryCode);
        if (!countryId) continue;

        const name = (s.name || '').substring(0, 100);
        const code = (s.isoCode || s.name || '').substring(0, 20);

        const dupKey = `${countryId}_${name.toLowerCase()}`;
        if (stateKeysSet.has(dupKey)) continue;
        stateKeysSet.add(dupKey);

        stateEntities.push({
          country_id: countryId,
          name,
          code: code || undefined,
        });
      }

      const BATCH_SIZE = 500;
      for (let i = 0; i < stateEntities.length; i += BATCH_SIZE) {
        const batch = stateEntities.slice(i, i + BATCH_SIZE);
        await this.stateRepository
          .createQueryBuilder()
          .insert()
          .into(State)
          .values(batch)
          .orIgnore()
          .execute();
      }

      const insertedStates = await this.stateRepository.find({
        select: { id: true, country_id: true, code: true, name: true },
      });
      const idToIso = new Map<number, string>();
      for (const [iso, id] of countryMap.entries()) {
        idToIso.set(id, iso);
      }
      for (const s of insertedStates) {
        const iso = idToIso.get(s.country_id);
        if (iso) {
          if (s.code) stateMap.set(`${iso}_${s.code}`, s.id);
          stateMap.set(`${iso}_${s.name}`, s.id);
        }
      }
      this.logger.log(`Successfully seeded ${insertedStates.length} states.`);
    }

    // 3. Seed Cities
    const existingCitiesCount = await this.cityRepository.count();
    if (existingCitiesCount > 0) {
      this.logger.log(`Cities already seeded (${existingCitiesCount} found). Skipping city insertion.`);
    } else {
      const allCscCities = cscCity.getAllCities();
      this.logger.log(`Seeding ${allCscCities.length} cities...`);

      const cityEntities: { state_id: number; name: string }[] = [];
      const cityKeysSet = new Set<string>();

      for (const c of allCscCities) {
        const stateId = stateMap.get(`${c.countryCode}_${c.stateCode}`) || stateMap.get(`${c.countryCode}_${c.name}`);
        if (!stateId) continue;

        const name = (c.name || '').substring(0, 100);
        const dupKey = `${stateId}_${name.toLowerCase()}`;
        if (cityKeysSet.has(dupKey)) continue;
        cityKeysSet.add(dupKey);

        cityEntities.push({
          state_id: stateId,
          name,
        });
      }

      this.logger.log(`Prepared ${cityEntities.length} unique cities for insertion.`);

      const BATCH_SIZE = 1000;
      for (let i = 0; i < cityEntities.length; i += BATCH_SIZE) {
        const batch = cityEntities.slice(i, i + BATCH_SIZE);
        await this.cityRepository
          .createQueryBuilder()
          .insert()
          .into(City)
          .values(batch)
          .orIgnore()
          .execute();
      }

      const finalCount = await this.cityRepository.count();
      this.logger.log(`Successfully seeded ${finalCount} cities.`);
    }

    this.logger.log('Location Seeder finished successfully.');
  }
}
