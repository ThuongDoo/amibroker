import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('cpu-usage')
  getCpuUsage(): any {
    const usage = process.cpuUsage();
    return { usage };
  }

  @Get('memory-usage')
  getMemoryUsage(): any {
    const usage = process.memoryUsage();
    return usage;
  }
}
