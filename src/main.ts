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
    
    Key Features:
    
    1. Video Content Management: Metatube API streamlines the management, uploading, and streaming of video content seamlessly. Developers can create, update, and organize videos with remarkable ease.
    
    2. Advanced Analytics: Gain detailed insights into your videos' performance with our analytics tools. Track views, comments, likes, and more to understand audience engagement.
    
    3. User Experience Customization: Integrate features like recommendations, personalized playlists, and smart suggestions to provide your users with a unique and engaging experience.
    
    4. Simplified Monetization: Metatube API supports flexible monetization solutions, including video advertising, subscriptions, and integrated transactions, providing developers with revenue generation opportunities.
    
    5. Security and Privacy: With advanced security protocols, Metatube API ensures data confidentiality while delivering a secure user experience.
    
    Easy Integration:
    
    Integrating Metatube API into your projects is simple and well-documented. Our comprehensive documentation, coupled with client libraries for various programming languages, makes the development process straightforward.
    
    Get Started Today:
    
    Explore the limitless possibilities of video by incorporating Metatube API into your applications. Whether you're building a streaming platform, a video-centric social network, or an educational app, Metatube is the ideal tool to bring your ideas to life.
    
    Join the video revolution with Metatube API!`)
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