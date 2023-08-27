import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { C4Service } from './c4.service';
import { Laion5BService } from './laion-5b.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, C4Service, Laion5BService],
})
export class AppModule {}
