import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RoleAndAdminSeeder } from './seeders/role-and-admin.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(RoleAndAdminSeeder);

  try {
    await seeder.seed();
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
