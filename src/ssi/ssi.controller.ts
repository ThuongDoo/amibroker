import { Controller, Get, Query } from '@nestjs/common';
import { SsiService } from './ssi.service';
import { Public } from 'src/shared/decorator/public.decorator';

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

  @Get('import/vnindex')
  async importVnindex() {
    return await this.ssiService.importVnindex();
  }

  @Public()
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

  @Public()
  @Get('changeAll')
  changeAll() {
    return this.ssiService.changeAll();
  }
}
