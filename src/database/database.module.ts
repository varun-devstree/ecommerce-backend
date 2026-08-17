import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../config/database.config';
import { SeederModule } from './seeders/seeder.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    SeederModule,
  ],
  exports: [TypeOrmModule, SeederModule],
})
export class DatabaseModule {}
