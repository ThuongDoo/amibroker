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
    // const lookupRequest =
    //   endpoints.INDEX_COMPONENT + '?lookupRequest.indexCode=' + '';
    // return await this.ssiService.importSSI('securityModel', lookupRequest);
  }

  @Get('get/Security')
  async getSecurity() {
    return await this.ssiService.getSecurity();
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
