import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as os from 'os';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('cpu-usage')
  getCpuUsage(): any {
    const usage = process.cpuUsage();
    const cpuUsage =
      (usage.user + usage.system) / (os.cpus().length * 1000 * 1000);
    return { cpuUsage: cpuUsage };
  }

  @Get('memory-usage')
  getMemoryUsage(): any {
    const usage = process.memoryUsage();
    return usage;
  }
}
