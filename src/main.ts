import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,             // omite data que no corresponde al DTO
      forbidNonWhitelisted: true,  // error si el body tiene data que no corresponde al DTO
      transform: true,             // transforma la data de los DTO a los tipos de datos que se espera, sirve para los query parameters ya que vienen todos como string
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )

  app.setGlobalPrefix('api/v2');

  await app.listen(process.env.PORT);
  console.log(`app running in port ${ process.env.PORT }`);
}
bootstrap();
