/* eslint-disable perfectionist/sort-imports */
import ddtrace from 'dd-trace';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const tracer = ddtrace.init({
  apmTracingEnabled: true,
  service: 'Soat Mechanic',
});
const provider = new tracer.TracerProvider();
provider.register();

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Mecânico')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
};
bootstrap();
