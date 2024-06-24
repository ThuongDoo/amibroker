import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { format } from 'date-fns';
import { Public } from './shared/decorator/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Public()
  @Get('cpu-usage')
  getCpuUsage(): any {
    const usage = process.cpuUsage();
    return { usage };
  }

  @Public()
  @Get('memory-usage')
  getMemoryUsage(): any {
    const usage = process.memoryUsage();
    return usage;
  }

  @Public()
  @Get('time')
  getCurrentDateTime(): string {
    const currentDateTime = new Date();
    return format(currentDateTime, 'yyyy-MM-dd HH:mm:ss');
  }
}
