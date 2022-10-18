import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // omite data que no corresponde al DTO
      forbidNonWhitelisted: true  // error si el body tiene data que no corresponde al DTO
    })
  )

  app.setGlobalPrefix('api/v2');

  await app.listen(3000);
}
bootstrap();
