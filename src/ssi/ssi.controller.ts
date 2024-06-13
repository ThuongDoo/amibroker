import { Controller, Get, Query } from '@nestjs/common';
import { SsiService } from './ssi.service';

@Controller('ssi')
export class SsiController {
  constructor(private ssiService: SsiService) {}
  @Get('import/security')
  async importSecurity() {
    return await this.ssiService.importSecurity();
  }

  @Get('import/indexComponent')
  async importIndexComponent() {
    return await this.ssiService.importIndexComponent();
  }

  @Get('security')
  async getSecurity(@Query('indexes') indexes: string) {
    return await this.ssiService.getSecurity(indexes);
  }

  @Get('fData')
  async getFData() {
    return this.ssiService.getFData();
  }

  @Get('miData')
  async getMiData(@Query('indexes') indexes: string) {
    return this.ssiService.getMiData(indexes);
  }
}