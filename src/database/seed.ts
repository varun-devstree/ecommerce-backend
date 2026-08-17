import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RoleAndAdminSeeder } from './seeders/role-and-admin.seeder';
import { LocationSeeder } from './seeders/location.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const roleAndAdminSeeder = app.get(RoleAndAdminSeeder);
  const locationSeeder = app.get(LocationSeeder);

  try {
    await roleAndAdminSeeder.seed();
    await locationSeeder.seed();
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

