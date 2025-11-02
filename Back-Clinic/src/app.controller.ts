import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(200)
  getHello(): string {
    return 'API Running ok';
  }

  @Get('health')
  @HttpCode(200)
  getHealth(): any {
    return {
      status: 'ok',
      message: 'API Running ok',
      timestamp: new Date().toISOString()
    };
  }
}
