import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Metatube API')
    .setDescription(`
    Welcome to the Metatube API Universe
    
    Metatube API provides a robust and versatile platform for integrating advanced video features into your applications, websites, and services. As a powerful solution, Metatube enables developers to harness functionalities akin to YouTube while offering exceptional flexibility.

    Explore the limitless possibilities of video by incorporating Metatube API into your applications. Whether you're building a streaming platform, a video-centric social network, or an educational app, Metatube is the ideal tool to bring your ideas to life.`)
    .setVersion('1.0')
    .addBearerAuth()
    .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);

  // Define custom Swagger UI configuration
  const swaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Api Metatube Production',
    customfavIcon:
      'https://static.vecteezy.com/system/resources/previews/018/930/572/original/youtube-logo-youtube-icon-transparent-free-png.png',
  };

  SwaggerModule.setup('', app, document, swaggerCustomOptions);
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();